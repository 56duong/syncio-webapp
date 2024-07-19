from nudenet import NudeDetector
nude_detector = NudeDetector()
result = nude_detector.detect('image.jpg') # Returns list of detections
print(result)

nude_detector.censor('image.jpg', classes=['BELLY_EXPOSED']) # Tu dong lam mo