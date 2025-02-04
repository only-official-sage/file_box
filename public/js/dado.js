const dropZone = document.getElementById('dropZone');
const Uuid = document.querySelector('#Uuid');
const folderSelect = document.querySelector('#folderSelect');
const folderCount = document.querySelector('#folderCount');
const fileDesc = document.querySelector('#fileDesc');
const uploadsArray = [];

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('bg-gray-300');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('bg-gray-300');
});

function uploadFile(file) {
    uploadsArray.push(file)
    const formData = new FormData();
    const folder = folderSelect.value;
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('uuid', Uuid.value);
    // call the crd endpoint 
    fetch('http://localhost:4090/api/crd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Specify that you're sending JSON
        },
        body: JSON.stringify({ folder: folder })
    }).then((res) => {
        if (res.ok) {
            fetch('http://localhost:4090/api/upload', {
                method: 'POST',
                body: formData
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('File upload failed');
                }
            }).then((msg) => {
                uploadsArray.pop()
                if (uploadsArray.length < 1) {
                    window.location.assign(msg.url);
                }
            }).catch((error) => {
                console.error('error', error);
            });
            return res.json();
        };
        throw new Error('Could not complete the process');
    }).catch((err) => {
        console.log(err);
    })
}

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('hover');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        // we can now upload each files if more than one
        Array.from(files).forEach((file) => {
            if (file.type == '') {
                console.warn(file)
                console.log('File type not supported');
            } else {
                uploadFile(file);
            }
        })
    }
});


onload = () => {
    fetch(`http://localhost:4090/api/folders/${Uuid.value}`).then((res) => {
        if (res.ok) {
            return res.json()
        }
    }).then((folders) => {
        const returnedFolders = Object.values(folders)[0];
        folderCount.innerHTML = returnedFolders.length
        returnedFolders.forEach((folder) => {
            const select = document.createElement('option');
            select.value = folder.foldername;
            select.innerHTML = folder.foldername;
            folderSelect.appendChild(select)
        })

        if (returnedFolders.length > 0) {
            dropZone.style.display = 'flex';
            fileDesc.innerHTML = "Drop a file  on the space above to upload";
        }

    }).catch((errors) => {
        console.log(errors);
    })
}