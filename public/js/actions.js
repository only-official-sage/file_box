const deleteWarning = document.querySelector('#deleteWarning');
const folderDelBtn = document.querySelector('#folderDelBtn');

const toggleItem = (id) => {
    const item = document.querySelector('.profile-modal');
    item.classList.toggle('hidden');
}

const logOutUser = () => {
    window.location.assign('/logout')
}

const showActionModal = (self) => {
    self.parentElement.parentElement.querySelector('#actionModal').classList.toggle('hidden');
    if (deleteWarning.innerHTML.length > 0) {
        deleteWarning.innerHTML = '';
        folderDelBtn.removeAttribute('data-del');
    }
}

const deleteFolder = (self) => {
    if (self.getAttribute('data-del') && self.getAttribute('data-del') == 'true') {
        fetch('http://localhost:4090/api/rmfd',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ foldername: self.getAttribute('data-name') })
        }).then((res) => {
            if (res.ok) return res.json();
        }).then((msg) => {
            console.log(msg);
            window.location.assign(msg.url)
        }).catch((err) => console.log(err))
    }

    self.setAttribute('data-del', 'true');
    deleteWarning.innerHTML = 'Confirm To Delete..?';
}

const deleteFile = (self) => {
    if (self.getAttribute('data-del') && self.getAttribute('data-del') == 'true') {
        // fetch('http://localhost:4090/api/rmf',{
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ filename: self.getAttribute('data-name') })
        // }).then((res) => {
        //     if (res.ok) return res.json();
        // }).then((msg) => {
        //     console.log(msg);
        //     window.location.assign(msg.url)
        // }).catch((err) => console.log(err))
        console.log('proceed');
    }

    self.setAttribute('data-del', 'true');
    deleteWarning.innerHTML = 'Confirm To Delete..?';
    console.log(deleteWarning);
}
