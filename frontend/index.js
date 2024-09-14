const form = document.getElementById("csvUploadForm");
const uploadedFilesList = document.getElementById("uploadedFilesList");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("csvFileInput");
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append("csvFile", file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                fileInput.value = "";
                form.reset();
                fetchUploadedFiles();
            } else {
                alert("Error in uploading file");
            }
        } catch (err) {
            console.log(`Error uploading file: ${err}`);
        }
    } else {
        console.log("No file selected for upload");
    }
});

async function fetchUploadedFiles() {
    try {
        const response = await fetch('/home', { method: 'GET' });
        const files = await response.json();

        if (files.length === 0) {
            document.getElementById('upload-section').style.display = 'none';
            return;
        }
        document.getElementById('upload-section').style.display = 'block';

        uploadedFilesList.innerHTML = '';

        files.forEach(file => {
            const row = document.createElement("tr");

            const filenameCell = document.createElement("td");
            filenameCell.textContent = file.filename;

            const actionCell = document.createElement('td');

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('btn', 'btn-outline-danger', 'btn-sm', 'me-2');
            deleteButton.addEventListener("click", () => deleteFile(file._id));

            const viewButton = document.createElement("button");
            viewButton.textContent = "View";
            viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
            viewButton.addEventListener("click", () => viewFile(file._id));

            actionCell.appendChild(deleteButton);
            actionCell.appendChild(viewButton);

            row.appendChild(filenameCell);
            row.appendChild(actionCell);

            uploadedFilesList.appendChild(row);
        });
    } catch (err) {
        console.error(`Error fetching uploaded files: ${err}`);
    }
}

async function deleteFile(fileId) {
    try {
        if (confirm("Are you sure you want to delete this file?")) {
            const response = await fetch('/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileId }),
            });

            if (response.ok) {
                fetchUploadedFiles();
            } else {
                console.log('Failed to delete file');
            }
        }
    } catch (err) {
        console.log(`Error deleting file: ${err}`);
    }
}

function viewFile(fileId) {
    const url = `view/?id=${fileId}`;
    window.open(url, '_blank');
}

fetchUploadedFiles();
