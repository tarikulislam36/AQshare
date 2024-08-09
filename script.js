// Initialize PeerJS with cloud server settings
const peer = new Peer({
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true, 
    debug: 3
});

let conn;
let fileInput = document.getElementById('fileInput');
let sendFileButton = document.getElementById('sendFile');
let remoteIdInput = document.getElementById('remoteId');
let connectButton = document.getElementById('connect');
let status = document.getElementById('status');
let transferStatus = document.getElementById('transferStatus');
let peerIdDisplay = document.getElementById('peerId');

peer.on('open', (id) => {
    peerIdDisplay.innerText = id; 
    status.innerText = 'Active';
});

peer.on('connection', (connection) => {
    conn = connection;
    conn.on('open', () => {
        status.innerText = 'Status: Connected to ' + conn.peer;
    });
    conn.on('data', (data) => {
        console.log('Received data:', data);
        if (data.file) {
            downloadFile(data.file);
            transferStatus.innerText = 'File Transfer: Completed';
        } else if (data.status === 'transferring') {
            transferStatus.innerText = 'File Transfer: In progress...';
        }
    });
});

connectButton.addEventListener('click', () => {
    const remoteId = remoteIdInput.value;
    conn = peer.connect(remoteId);
    conn.on('open', () => {
        console.log('Connected to remote peer');
        status.innerText = 'Status: Connected to ' + remoteId;
    });
    conn.on('error', (err) => {
        console.error(err);
        status.innerText = 'Status: Error connecting to ' + remoteId;
    });
});

sendFileButton.addEventListener('click', () => {
    if (conn && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        // Notify the remote peer that a file is being transferred
        conn.send({ status: 'transferring' });
        transferStatus.innerText = 'File Transfer: In progress...';

        reader.onload = () => {
            const fileData = reader.result;
            conn.send({ file: { name: file.name, data: fileData } });
        };

        reader.readAsArrayBuffer(file);
    } else {
        alert('No file selected or no connection established');
    }
});

function downloadFile(file) {
    const blob = new Blob([file.data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    window.URL.revokeObjectURL(url);
}
