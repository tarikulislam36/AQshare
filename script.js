const peer = new Peer({
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true,
    debug: 3,
});

let conn;
let fileInput = document.getElementById('fileInput');
let sendFileButton = document.getElementById('sendFile');
let remoteIdInput = document.getElementById('remoteId');
let connectButton = document.getElementById('connect');
let status = document.getElementById('status');
let transferStatus = document.getElementById('transferStatus');
let peerIdDisplay = document.getElementById('peerId');

// Display Peer ID
peer.on('open', (id) => {
    peerIdDisplay.innerText = id;
    status.innerText = 'Active';
});

// Handle incoming connection
peer.on('connection', (connection) => {
    conn = connection;
    conn.on('open', () => {
        status.innerText = `Connected to ${conn.peer}`;
    });
    conn.on('data', (data) => {
        console.log('Received data:', data);
        if (data.file) {
            transferStatus.innerText = 'File Transfer: Completed';
        }
    });
});

// Connect to remote peer
connectButton.addEventListener('click', () => {
    const remoteId = remoteIdInput.value;
    conn = peer.connect(remoteId);
    conn.on('open', () => {
        status.innerText = `Connected to ${remoteId}`;
    });
    conn.on('error', (err) => {
        status.innerText = `Error: ${err.message}`;
    });
});

// Send file
sendFileButton.addEventListener('click', () => {
    if (conn && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        conn.send({ status: 'transferring' });
        transferStatus.innerText = 'File Transfer: In progress...';

        reader.onload = () => {
            const fileData = reader.result.split(',')[1]; // Get Base64 data
            conn.send({ file: { name: file.name, data: fileData } });
        };

        reader.readAsDataURL(file);
    } else {
        alert('No file selected or no connection established');
    }
});
