import './style.css'
import { display } from './models/pose.ts'

let userWebcamStream: MediaStream
document.getElementById('startWebcam')!.addEventListener('click', function() {
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    const webcam = document.getElementById('webcam') as HTMLVideoElement
    userWebcamStream = stream
    webcam.srcObject = stream
    webcam.style.display = 'inherit'
    document.getElementById('startWebcam')!.style.display = 'none'
  })

})

document.getElementById('startSensei')!.addEventListener('click', function() {
  // check if user webcam is on, if not display an alert
  const userWebcam = document.getElementById('webcam') as HTMLVideoElement
  const senseiVideo = document.getElementById('senseiVideo') as HTMLVideoElement
  if (!userWebcam.srcObject) {
    alert('Before welcoming Sensei, please turn on your camera')
    return
  }
  // pull the video link from the url and add it to the video stream
  const urlSearch = new URLSearchParams(window.location.search)
  const videoSrcURI = urlSearch.get('sensei_video_src')
  if (!videoSrcURI) {
    alert('Missing sensei video link')
    return
  }
  senseiVideo.style.display = userWebcam.style.display
  senseiVideo.loop = true
  senseiVideo.src = videoSrcURI
  senseiVideo.play()
  document.getElementById('startSensei')!.style.display = 'none'
  document.getElementById('replayButton')!.style.display = 'block'
})


display()