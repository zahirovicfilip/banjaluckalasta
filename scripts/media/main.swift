// Native macOS media helper, used by scripts/build-media.sh. No ffmpeg needed:
// everything goes through AVFoundation, CoreGraphics and PDFKit.
//   media probe <video>...
//   media frames <video> <outPrefix> <maxW> <N | t1,t2,...>
//   media sheet <out.jpg> <cols> <cellW> <label=path>...
//   media colors <image> <x,y>...            (x,y as 0..1 fractions)
//   media pdftext <pdf>
//   media bbox <image>                       (bounding box of non-transparent pixels)
//   media img <in> <out.jpg|png> [crop=x,y,w,h in px] [w=maxWidth] [q=0.8] [rot=90|180|270]
//   media layers <out.jpg|png> <W> <H> [fill=#RRGGBBAA,x,y,w,h | <image>,x,y,w]...   (drawn in order, top-left origin)
//   media export <video> <out.mp4> <start> <duration> <maxW> <kbps> [crop=x,y,w,h as fractions] [fps=30] [speed=1]
import AVFoundation
import AppKit
import CoreGraphics
import Foundation
import PDFKit

setvbuf(stdout, nil, _IONBF, 0)
let args = Array(CommandLine.arguments.dropFirst())
guard let cmd = args.first else { print("usage: media <probe|frames|sheet|colors|pdftext|export> ..."); exit(1) }

func writeJPEG(_ image: CGImage, to path: String, quality: Double = 0.8) {
  let rep = NSBitmapImageRep(cgImage: image)
  let data = rep.representation(using: .jpeg, properties: [.compressionFactor: quality])!
  try! data.write(to: URL(fileURLWithPath: path))
}

func loadCG(_ path: String) -> CGImage? {
  guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil) else { return nil }
  return CGImageSourceCreateImageAtIndex(src, 0, nil)
}

func run<T>(_ op: @escaping () async throws -> T) -> T {
  let sem = DispatchSemaphore(value: 0)
  var result: Result<T, Error>!
  Task.detached {
    do { result = .success(try await op()) } catch { result = .failure(error) }
    sem.signal()
  }
  sem.wait()
  switch result! {
  case .success(let v): return v
  case .failure(let e): print("ERROR: \(e)"); exit(2)
  }
}

struct Info { var duration: Double; var size: CGSize; var fps: Float; var hasAudio: Bool; var transform: CGAffineTransform; var natural: CGSize; var bitrate: Float }

func info(_ asset: AVURLAsset) async throws -> Info {
  let duration = try await asset.load(.duration).seconds
  let vtracks = try await asset.loadTracks(withMediaType: .video)
  let atracks = try await asset.loadTracks(withMediaType: .audio)
  guard let v = vtracks.first else { return Info(duration: duration, size: .zero, fps: 0, hasAudio: !atracks.isEmpty, transform: .identity, natural: .zero, bitrate: 0) }
  let natural = try await v.load(.naturalSize)
  let t = try await v.load(.preferredTransform)
  let fps = try await v.load(.nominalFrameRate)
  let rate = try await v.load(.estimatedDataRate)
  let r = CGRect(origin: .zero, size: natural).applying(t)
  return Info(duration: duration, size: CGSize(width: abs(r.width), height: abs(r.height)), fps: fps, hasAudio: !atracks.isEmpty, transform: t, natural: natural, bitrate: rate)
}

switch cmd {
case "probe":
  for path in args.dropFirst() {
    let asset = AVURLAsset(url: URL(fileURLWithPath: path))
    let i = run { try await info(asset) }
    let name = (path as NSString).lastPathComponent
    print(String(format: "%@\t%.1fs\t%dx%d\t%.0ffps\t%.1fMbps\taudio=%@", name, i.duration, Int(i.size.width), Int(i.size.height), i.fps, i.bitrate / 1_000_000, i.hasAudio ? "y" : "n"))
  }

case "frames":
  let path = args[1], prefix = args[2], maxW = Double(args[3])!, spec = args[4]
  let asset = AVURLAsset(url: URL(fileURLWithPath: path))
  let i = run { try await info(asset) }
  var times: [Double]
  if spec.contains(",") || spec.contains(".") { times = spec.split(separator: ",").map { Double($0)! } }
  else { let n = Int(spec)!; times = (0..<n).map { (Double($0) + 0.5) * i.duration / Double(n) } }
  let gen = AVAssetImageGenerator(asset: asset)
  gen.appliesPreferredTrackTransform = true
  gen.requestedTimeToleranceBefore = CMTime(seconds: 0.05, preferredTimescale: 600)
  gen.requestedTimeToleranceAfter = CMTime(seconds: 0.05, preferredTimescale: 600)
  let scale = min(1, maxW / max(1, i.size.width))
  gen.maximumSize = CGSize(width: i.size.width * scale, height: i.size.height * scale)
  for (k, t) in times.enumerated() {
    let img: CGImage = run { try await gen.image(at: CMTime(seconds: t, preferredTimescale: 600)).image }
    let out = String(format: "%@_%02d.jpg", prefix, k)
    writeJPEG(img, to: out, quality: 0.82)
    print(String(format: "%@\t%.2fs", out, t))
  }

case "sheet":
  let out = args[1], cols = Int(args[2])!, cellW = CGFloat(Double(args[3])!)
  let items = args.dropFirst(4).map { s -> (String, String) in
    let parts = s.split(separator: "=", maxSplits: 1).map(String.init)
    return parts.count == 2 ? (parts[0], parts[1]) : ((s as NSString).lastPathComponent, s)
  }
  let images = items.compactMap { (label, path) -> (String, CGImage)? in loadCG(path).map { (label, $0) } }
  guard !images.isEmpty else { print("no images"); exit(1) }
  let pad: CGFloat = 6, labelH: CGFloat = 18
  let heights = images.map { cellW * CGFloat($0.1.height) / CGFloat($0.1.width) }
  let rows = Int(ceil(Double(images.count) / Double(cols)))
  var rowH = [CGFloat](repeating: 0, count: rows)
  for (k, h) in heights.enumerated() { rowH[k / cols] = max(rowH[k / cols], h) }
  let W = CGFloat(cols) * (cellW + pad) + pad
  let H = rowH.reduce(0, +) + CGFloat(rows) * (labelH + pad) + pad
  let ctx = CGContext(data: nil, width: Int(W), height: Int(H), bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.setFillColor(CGColor(gray: 0.12, alpha: 1)); ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
  let ns = NSGraphicsContext(cgContext: ctx, flipped: false)
  var yTop: CGFloat = pad
  for r in 0..<rows {
    for c in 0..<cols {
      let k = r * cols + c
      guard k < images.count else { break }
      let x = pad + CGFloat(c) * (cellW + pad)
      let h = heights[k]
      let yBottomOfLabel = H - yTop - labelH
      NSGraphicsContext.current = ns
      (images[k].0 as NSString).draw(at: CGPoint(x: x + 2, y: yBottomOfLabel + 2), withAttributes: [.font: NSFont.boldSystemFont(ofSize: 12), .foregroundColor: NSColor.white])
      NSGraphicsContext.current = nil
      ctx.interpolationQuality = .high
      ctx.draw(images[k].1, in: CGRect(x: x, y: yBottomOfLabel - h, width: cellW, height: h))
    }
    yTop += rowH[r] + labelH + pad
  }
  writeJPEG(ctx.makeImage()!, to: out, quality: 0.78)
  print("\(out)\t\(Int(W))x\(Int(H))\t\(images.count) images")

case "colors":
  guard let img = loadCG(args[1]) else { print("cannot load"); exit(1) }
  let w = img.width, h = img.height
  let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
  let buf = ctx.data!.bindMemory(to: UInt8.self, capacity: w * h * 4)
  if args.count > 2 {
    for p in args.dropFirst(2) {
      let xy = p.split(separator: ",").map { Double($0)! }
      let x = min(w - 1, Int(xy[0] * Double(w))), y = min(h - 1, Int(xy[1] * Double(h)))
      let o = (y * w + x) * 4
      print(String(format: "%@ -> #%02X%02X%02X a=%d", p, buf[o], buf[o + 1], buf[o + 2], buf[o + 3]))
    }
  } else {
    // Coarse histogram (4 bits/channel) of opaque pixels, top 12 buckets with their mean colour.
    var count = [Int: Int](), sum = [Int: (Int, Int, Int)]()
    let step = max(1, Int(sqrt(Double(w * h) / 400_000)))
    var y = 0
    while y < h { var x = 0
      while x < w {
        let o = (y * w + x) * 4
        if buf[o + 3] > 200 {
          let key = (Int(buf[o]) >> 4) << 8 | (Int(buf[o + 1]) >> 4) << 4 | (Int(buf[o + 2]) >> 4)
          count[key, default: 0] += 1
          let s = sum[key] ?? (0, 0, 0)
          sum[key] = (s.0 + Int(buf[o]), s.1 + Int(buf[o + 1]), s.2 + Int(buf[o + 2]))
        }
        x += step }
      y += step }
    let total = count.values.reduce(0, +)
    for (key, n) in count.sorted(by: { $0.value > $1.value }).prefix(12) {
      let s = sum[key]!
      print(String(format: "#%02X%02X%02X  %.1f%%", s.0 / n, s.1 / n, s.2 / n, 100 * Double(n) / Double(total)))
    }
  }

case "pdftext":
  guard let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else { print("cannot open pdf"); exit(1) }
  for p in 0..<doc.pageCount {
    let page = doc.page(at: p)!
    let b = page.bounds(for: .mediaBox)
    print("=== page \(p + 1) (\(Int(b.width))x\(Int(b.height)) pt) ===")
    print(page.string ?? "")
  }

case "bbox":
  guard let img = loadCG(args[1]) else { print("cannot load"); exit(1) }
  let w = img.width, h = img.height
  let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
  let buf = ctx.data!.bindMemory(to: UInt8.self, capacity: w * h * 4)
  var x0 = w, y0 = h, x1 = -1, y1 = -1
  for y in 0..<h { for x in 0..<w where buf[(y * w + x) * 4 + 3] > 8 { x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y) } }
  print("\(x0),\(y0),\(x1 - x0 + 1),\(y1 - y0 + 1)\tof \(w)x\(h)")

case "img":
  // Crop (pixel box, top-left origin), rotate, scale down and re-encode one image.
  guard var img = loadCG(args[1]) else { print("cannot load \(args[1])"); exit(1) }
  let out = args[2]
  var maxW: CGFloat = .greatestFiniteMagnitude, q = 0.8, rot = 0
  for a in args.dropFirst(3) {
    if a.hasPrefix("crop=") { let v = a.dropFirst(5).split(separator: ",").map { CGFloat(Double($0)!) }; img = img.cropping(to: CGRect(x: v[0], y: v[1], width: v[2], height: v[3]))! }
    if a.hasPrefix("w=") { maxW = CGFloat(Double(a.dropFirst(2))!) }
    if a.hasPrefix("q=") { q = Double(a.dropFirst(2))! }
    if a.hasPrefix("rot=") { rot = Int(a.dropFirst(4))! }
  }
  let turned = rot == 90 || rot == 270
  let srcW = CGFloat(turned ? img.height : img.width), srcH = CGFloat(turned ? img.width : img.height)
  let k = min(1, maxW / srcW)
  let W = Int((srcW * k).rounded()), H = Int((srcH * k).rounded())
  let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.interpolationQuality = .high
  ctx.translateBy(x: CGFloat(W) / 2, y: CGFloat(H) / 2)
  ctx.rotate(by: -CGFloat(rot) * .pi / 180)
  let dw = turned ? CGFloat(H) : CGFloat(W), dh = turned ? CGFloat(W) : CGFloat(H)
  ctx.draw(img, in: CGRect(x: -dw / 2, y: -dh / 2, width: dw, height: dh))
  let result = ctx.makeImage()!
  if out.lowercased().hasSuffix(".png") {
    try! NSBitmapImageRep(cgImage: result).representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
  } else { writeJPEG(result, to: out, quality: q) }
  let bytes = ((try? FileManager.default.attributesOfItem(atPath: out))?[.size] as? Int) ?? 0
  print(String(format: "%@\t%dx%d\t%d KB", (out as NSString).lastPathComponent, W, H, bytes / 1024))

case "layers":
  // Flat composition for share images: colour fills and images stacked in order.
  let out = args[1], W = Int(args[2])!, H = Int(args[3])!
  let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.interpolationQuality = .high
  for a in args.dropFirst(4) {
    if a.hasPrefix("fill=") {
      let v = a.dropFirst(5).split(separator: ",").map(String.init)
      let hex = UInt64(v[0].dropFirst(), radix: 16)!
      let c = CGColor(srgbRed: CGFloat((hex >> 24) & 255) / 255, green: CGFloat((hex >> 16) & 255) / 255, blue: CGFloat((hex >> 8) & 255) / 255, alpha: CGFloat(hex & 255) / 255)
      let r = v.dropFirst().map { CGFloat(Double($0)!) }
      ctx.setFillColor(c); ctx.fill(CGRect(x: r[0], y: CGFloat(H) - r[1] - r[3], width: r[2], height: r[3]))
    } else {
      let v = a.split(separator: ",").map(String.init)
      guard let im = loadCG(v[0]) else { print("cannot load \(v[0])"); exit(1) }
      let x = CGFloat(Double(v[1])!), y = CGFloat(Double(v[2])!), w = CGFloat(Double(v[3])!)
      let h = w * CGFloat(im.height) / CGFloat(im.width)
      ctx.draw(im, in: CGRect(x: x, y: CGFloat(H) - y - h, width: w, height: h))
    }
  }
  let result = ctx.makeImage()!
  if out.lowercased().hasSuffix(".png") {
    try! NSBitmapImageRep(cgImage: result).representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
  } else { writeJPEG(result, to: out, quality: 0.86) }
  print("\((out as NSString).lastPathComponent)\t\(W)x\(H)")

case "export":
  // Trim, crop, scale and (optionally) speed up a clip into a silent, web-ready H.264 MP4.
  let src = args[1], out = args[2]
  let start = Double(args[3])!, dur = Double(args[4])!, maxW = Double(args[5])!, kbps = Double(args[6])!
  var crop = CGRect(x: 0, y: 0, width: 1, height: 1), fps: Int32 = 30, speed = 1.0
  for a in args.dropFirst(7) {
    if a.hasPrefix("crop=") { let v = a.dropFirst(5).split(separator: ",").map { Double($0)! }; crop = CGRect(x: v[0], y: v[1], width: v[2], height: v[3]) }
    if a.hasPrefix("fps=") { fps = Int32(a.dropFirst(4))! }
    if a.hasPrefix("speed=") { speed = Double(a.dropFirst(6))! }
  }
  let asset = AVURLAsset(url: URL(fileURLWithPath: src))
  let i = run { try await info(asset) }
  let track = run { try await asset.loadTracks(withMediaType: .video).first! }
  let cropPx = CGRect(x: crop.minX * i.size.width, y: crop.minY * i.size.height, width: crop.width * i.size.width, height: crop.height * i.size.height)
  let scale = min(1, maxW / cropPx.width)
  let outW = Int((cropPx.width * scale / 2).rounded()) * 2, outH = Int((cropPx.height * scale / 2).rounded()) * 2
  let range = CMTimeRange(start: CMTime(seconds: start, preferredTimescale: 600), duration: CMTime(seconds: min(dur, i.duration - start), preferredTimescale: 600))

  // Put the selected range on its own timeline so it can be retimed.
  let timeline = AVMutableComposition()
  let ctrack = timeline.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)!
  try! ctrack.insertTimeRange(range, of: track, at: .zero)
  if speed != 1 {
    ctrack.scaleTimeRange(CMTimeRange(start: .zero, duration: range.duration), toDuration: CMTimeMultiplyByFloat64(range.duration, multiplier: 1 / speed))
  }
  let total = timeline.duration

  let comp = AVMutableVideoComposition()
  comp.renderSize = CGSize(width: outW, height: outH)
  comp.frameDuration = CMTime(value: 1, timescale: fps)
  comp.colorPrimaries = AVVideoColorPrimaries_ITU_R_709_2
  comp.colorTransferFunction = AVVideoTransferFunction_ITU_R_709_2
  comp.colorYCbCrMatrix = AVVideoYCbCrMatrix_ITU_R_709_2
  let inst = AVMutableVideoCompositionInstruction()
  inst.timeRange = CMTimeRange(start: .zero, duration: total)
  let layer = AVMutableVideoCompositionLayerInstruction(assetTrack: ctrack)
  // preferredTransform maps natural -> display (possibly with a negative origin); normalise, then crop + scale.
  let displayRect = CGRect(origin: .zero, size: i.natural).applying(i.transform)
  var t = i.transform.concatenating(CGAffineTransform(translationX: -displayRect.minX, y: -displayRect.minY))
  t = t.concatenating(CGAffineTransform(translationX: -cropPx.minX, y: -cropPx.minY))
  t = t.concatenating(CGAffineTransform(scaleX: CGFloat(outW) / cropPx.width, y: CGFloat(outH) / cropPx.height))
  layer.setTransform(t, at: .zero)
  inst.layerInstructions = [layer]
  comp.instructions = [inst]

  let reader = try! AVAssetReader(asset: timeline)
  let rout = AVAssetReaderVideoCompositionOutput(videoTracks: [ctrack], videoSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange])
  rout.videoComposition = comp
  rout.alwaysCopiesSampleData = false
  reader.add(rout)

  try? FileManager.default.removeItem(atPath: out)
  let writer = try! AVAssetWriter(outputURL: URL(fileURLWithPath: out), fileType: .mp4)
  writer.shouldOptimizeForNetworkUse = true
  let win = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: outW, AVVideoHeightKey: outH,
    AVVideoCompressionPropertiesKey: [
      AVVideoAverageBitRateKey: Int(kbps * 1000),
      AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
      AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2,
      AVVideoExpectedSourceFrameRateKey: Int(fps),
      AVVideoAllowFrameReorderingKey: true,
    ] as [String: Any],
    AVVideoColorPropertiesKey: [
      AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
      AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
      AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
    ],
  ])
  win.expectsMediaDataInRealTime = false
  writer.add(win)
  reader.startReading(); writer.startWriting()
  writer.startSession(atSourceTime: .zero)
  let q = DispatchQueue(label: "enc"), done = DispatchSemaphore(value: 0)
  var frames = 0
  win.requestMediaDataWhenReady(on: q) {
    while win.isReadyForMoreMediaData {
      if let sb = rout.copyNextSampleBuffer() { win.append(sb); frames += 1 }
      else { win.markAsFinished(); done.signal(); return }
    }
  }
  done.wait()
  let fin = DispatchSemaphore(value: 0)
  writer.finishWriting { fin.signal() }
  fin.wait()
  if writer.status != .completed { print("ERROR: \(String(describing: writer.error)) reader=\(String(describing: reader.error))"); exit(2) }
  let bytes = ((try? FileManager.default.attributesOfItem(atPath: out))?[.size] as? Int) ?? 0
  print(String(format: "%@\t%dx%d\t%d frames\t%.1fs\t%.2f MB", (out as NSString).lastPathComponent, outW, outH, frames, total.seconds, Double(bytes) / 1_048_576))

default:
  print("unknown command \(cmd)"); exit(1)
}
