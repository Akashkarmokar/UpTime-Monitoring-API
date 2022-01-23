// Dependencies
const fs = require('fs');
const path = require('path');

// Module Scaffolding
const lib = {};

// Base directory of the data folder
lib.basedir = path.join(__dirname, '/../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
    // open file
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (createErr, createFileDescriptor) => {
        if (!createErr && createFileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // Write Data to file and then close it
            fs.writeFile(createFileDescriptor, stringData, (writeErr) => {
                if (!writeErr) {
                    // File write is done now we need to close file
                    fs.close(createFileDescriptor, (closeErr) => {
                        if (!closeErr) {
                            callback(false);
                        } else {
                            callback('Error: closing the file!');
                        }
                    });
                } else {
                    callback('Error: Writing to file!');
                }
            });
        } else {
            callback('There was an error, file may already exists!');
        }
    });
};

// Read data from existing file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf-8', (readErr, data) => {
        callback(readErr, data);
    });
};
// Update Existing file
lib.update = (dir, file, data, callback) => {
    // open file
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (openErr, openFileDescriptor) => {
        if (!openErr && openFileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // turncate the file
            fs.ftruncate(openFileDescriptor, (turncateErr) => {
                if (!turncateErr) {
                    // write to the file and close the file
                    fs.writeFile(openFileDescriptor, stringData, (writeErr) => {
                        if (!writeErr) {
                            // write is done ,now close it
                            // close the file
                            fs.close(openFileDescriptor, (closeErr) => {
                                if (!closeErr) {
                                    callback(false);
                                } else {
                                    callback('Error: closing the file!');
                                }
                            });
                        } else {
                            callback('Error: writing to file');
                        }
                    });
                } else {
                    callback('Error: Turncating file!');
                }
            });
        } else {
            callback('Error: Updating, File may not exist');
        }
    });
};
// Delete existing file
lib.delete = (dir, file, callback) => {
    // unlink the file
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (unlinkErr) => {
        if (!unlinkErr) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};

// list all the item in a directory
lib.list = (dir, callback) => {
    fs.readdir(`${lib.basedir + dir}/`, (err, fileNames) => {
        if (!err && fileNames && fileNames.length > 0) {
            const trimmedFiles = [];
            fileNames.forEach((fileName) => {
                trimmedFiles.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFiles);
        } else {
            callback('Error reading directory!');
        }
    });
};
// Export module
module.exports = lib;
