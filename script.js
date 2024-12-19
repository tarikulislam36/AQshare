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

// Display your Peer ID
peer.on('open', (id) => {
    peerIdDisplay.innerText = id; 
    status.innerText = 'Active';
});

// Listen for incoming connections
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

// Connect to a remote peer
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

// Send the selected file to the connected peer
sendFileButton.addEventListener('click', () => {
    if (conn && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        // Notify the remote peer that a file is being transferred
        conn.send({ status: 'transferring' });
        transferStatus.innerText = 'File Transfer: In progress...';

        reader.onload = () => {
            const fileData = reader.result.split(',')[1]; // Convert to Base64
            conn.send({ file: { name: file.name, data: fileData } });
        };

        reader.readAsDataURL(file); // Read file as Data URL (Base64 format)
    } else {
        alert('No file selected or no connection established');
    }
});

// Helper function to download the received file
function downloadFile(file) {
    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${file.data}`;
    link.download = file.name;
    link.click();
}
