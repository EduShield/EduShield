import { uploadFile, listUploadedFiles, downloadFile, deleteFile } from "./app.js";

const fileInput = document.querySelector('#upload-file-input');
const uploadFileBtn = document.querySelector('#upload-file-btn');
const uploadFileDetails = document.querySelector('#upload-file-details');
const manageDataTableBody = document.querySelector('#manage-data-table-body');

let selectedFile = null;

fileInput.addEventListener('change', (event) => {
    selectedFile = event.target.files[0];
    uploadFileDetails.innerHTML = `${selectedFile.name}<br>${(selectedFile.size / 1024).toFixed(2)} KB`;
    console.log(selectedFile);
});

uploadFileBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        alert('Please select a file to send');
        return;
    }

    uploadFileBtn.disabled = true;
    uploadFileBtn.style.cursor = 'not-allowed';
    uploadFileDetails.innerHTML = `Uploading...<br>${selectedFile.name}`;
    await uploadFile(selectedFile);
    uploadFileDetails.innerHTML = `Successfully Uploaded<br>${selectedFile.name}`;
    displayUploadedFiles();
    setTimeout(() => {
        selectedFile = null;
        fileInput.value = '';
        uploadFileBtn.disabled = false;
        uploadFileBtn.style.cursor = 'pointer';
        uploadFileDetails.innerHTML = 'Select A File <br> To Upload';
    }, 1500);
});

window.addEventListener('load', () => {
    setTimeout(() => {
        displayUploadedFiles();
    }, 2000);
});

manageDataTableBody.addEventListener('click', async (event) => {
    if (event.target.classList.contains('manage-data-download-btn-icon')) {
        const fileName = event.target.getAttribute('name');
        console.log(fileName);
        await downloadFile(fileName)
            .then((url) => {
                console.log(url);
                window.open(url, '_blank');
            })
            .catch((error) => {
                console.error('Error getting download URL: ', error);
            });
    }
    else if (event.target.classList.contains('manage-data-delete-btn-icon')) {
        const fileName = event.target.getAttribute('name');
        console.log(fileName);
        await deleteFile(fileName)
            .then(() => {
                console.log('File successfully deleted');
                displayUploadedFiles();
                // manageDataTableBody.removeChild(event.target.parentElement.parentElement.parentElement);
            })
            .catch((error) => {
                console.error('Error deleting file: ', error);
            });
    }
});

function addFileToTable(file) {
    if (!file) {
        manageDataTableBody.innerHTML = `
            <tr align="center" name="null">
                <td colspan="2">No Files Uploaded</td>
            </tr>`;
        return;
    }

    const element = `
        <tr align="center" name="${file.name}">
            <td>${file.name}</td>
            <td class="manage-data-btns">
                <button class="manage-data-download-btn" name="${file.name}">
                    <span class="material-symbols-rounded manage-data-download-btn-icon" name="${file.name}">cloud_download</span>
                </button>
                <button class="manage-data-delete-btn" name="${file.name}">
                    <span class="material-symbols-rounded manage-data-delete-btn-icon" name="${file.name}">delete</span>
                </button>
            </td>
        </tr>`;

    manageDataTableBody.innerHTML += element;
}

function displayUploadedFiles() {
    listUploadedFiles()
        .then((files) => {
            if (files.items.length === 0) {
                manageDataTableBody.innerHTML = '';
                addFileToTable(null);
            } else {
                manageDataTableBody.innerHTML = '';
                files.items.forEach((file) => {
                    addFileToTable(file);
                });
            }
        })
        .catch((error) => {
            console.error('Error listing files: ', error);
        });
}