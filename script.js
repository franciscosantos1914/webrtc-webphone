const peer = new Peer(
  `${Math.floor(Math.random() * 2 ** 18)
    .toString(36)
    .padStart(4, 0)}`,
  {
    host: location.hostname,
    debug: 1,
    path: "/webrtc-call",
  }
);

window.peer = peer;

function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      window.localStream = stream;
      window.localAudio.srcObject = stream;
      window.localAudio.autoplay = true;
    })
    .catch((err) => {
      console.error(`you got an error: ${err}`);
    });
}

getLocalStream();

peer.on("open", () => {
  window.caststatus.textContent = `Your device ID is: ${peer.id}`;
});

const callBtn = document.querySelector(".call-btn");
const audioContainer = document.querySelector(".call-container");

// Displays the call button and peer ID
function showCallContent() {
  window.caststatus.textContent = `Your device ID is: ${peer.id}`;
  callBtn.hidden = false;
  audioContainer.hidden = true;
}

// Displays the audio controls and correct copy
function showConnectedContent() {
  window.caststatus.textContent = "You're connected";
  callBtn.hidden = true;
  audioContainer.hidden = false;
}

let code;
function getStreamCode() {
  code = window.prompt("Please enter the sharing code");
}

let conn;
function connectPeers() {
  conn = peer.connect(code);
}

peer.on("connection", (connection) => {
  conn = connection;
});

callBtn.addEventListener("click", () => {
  getStreamCode();
  connectPeers();
  const call = peer.call(code, window.localStream);

  call.on("stream", (stream) => {
    window.remoteAudio.srcObject = stream;
    window.remoteAudio.autoplay = true;
    window.peerStream = stream;
    showConnectedContent();
  });
});

peer.on("call", (call) => {
  const answerCall = confirm("Do you want to answer?");
  if (answerCall) {
    call.answer(window.localStream);
    showConnectedContent();
    call.on("stream", (stream) => {
      window.remoteAudio.srcObject = stream;
      window.remoteAudio.autoplay = true;
      window.peerStream = stream;
    });
  } else {
    console.log("call denied");
  }
});

const hangUpBtn = document.querySelector(".hangup-btn");
hangUpBtn.addEventListener("click", () => {
  conn.close();
  showCallContent();
});

conn.on("close", () => {
  showCallContent();
});
