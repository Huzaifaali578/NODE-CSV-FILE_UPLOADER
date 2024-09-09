const form = document.getElementById("csvUploadForm");
const uploadedFilesList = document.getElementById("uploadedFilesList");

// handle thw upload file form
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fileInput = document.getElementById("csvFileInput");
    const file = fileInput.files[0];
    if (file) {
        const fromData = new FromData();
        fromData.append("csvFile", file)
    };
    try {
        const responce = await fetch('/upload', {
            // sending the POST req along with uploaded data.
            method: 'POST',
            body: FormData
        });
        if (responce.ok) {
            console.log("file uploaded successfully");
            fileInput.value = "";
            fetchUploadedFiles();
        } else {
            console.log("Error in Uploading File")
        }
    } catch (err) {
        console.log(`Error uploading file: ${err}`)
    }
});

async function fetchUploadedFiles() {
    try {
        const responce = await fetch('/home', { method: 'GET' });
        const files = await responce.json();
        if (files.length == 0) {
            // if no file exist, do not display the file-list hearder.
            document.getElementById("upload-section").style.display = 'none';
            return
        }
        console.log(`Files fetched: ${files}`);
        document.getElementById("upload-section").style.display = 'block';
        uploadedFilesList.innerHTML = '';
        // render the list of file.
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
    } catch (err) {
        console.error(`Error fetching uploaded files: ${err}`);
    }
};


// handle the deletion of file.
async function deleteFile(fileId) {
    try {
        console.log(`Deleting file with ID: ${fileId}`);
        const responce = await fetch('/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileId })
        });
        if (responce.ok) {
            console.log('File deleted successfully');
            // redirect to the /home.
            fetchUploadedFiles();
        }

    } catch (err) {
        console.log(`Error deleting file: ${err}`)
    }

};

//send request to view a particular file, along with the file-id in req.query
function viewFile(fileId) {
    const url = `view/?id=${fileId}`;
    window.open(url);
    console.log(`Opening file with id: ${fileId}`);
};

fetchUploadedFiles();

