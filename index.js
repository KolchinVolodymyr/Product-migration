const express = require("express");
const upload = require("express-fileupload");
const csv = require('csvtojson');
const csvWriter = require('csv-write-stream');
const fs = require('fs');

const app = express();
app.use(upload({useTempFiles: true}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.post('/', (req, res) =>{
    if(req.files) {
        const data = [];
        let getProducts =
        csv()
            .fromFile(req.files.file.tempFilePath)
            .then((jsonObj) => {
//                console.log('jsonObj', jsonObj);

        var combinedItems = jsonObj.reduce(function(arr, item, index) {
            var found = false;

            for (var i = 0; i < arr.length; i++) {
                if (arr[i].Email === item.Email) {
                    found = true;
//                    arr[i].count++;
                    arr[i].arr.push({
                        'Address Line 1': item.Address1,
                        'Address Line 2': item.Address2,
                        'Address Company': item.Company,
                        'Address City': item.City,
                        'Address Zip': item.Zip,
                        'Address Country': item.Country,
                        'Address Phone': item.Phone,
                    })
                }
            }

            if (!found) {
                item.arr = [{
                    'Address Line 1': item.Address1,
                    'Address Line 2': item.Address2,
                    'Address Company': item.Company,
                    'Address City': item.City,
                    'Address Zip': item.Zip,
                    'Address Country': item.Country,
                    'Address Phone': item.Phone,
                }];
//                item.count = 1;

                arr.push(item);
                data.push(arr[i]);
            }

            return arr;
        }, [])

            });

        Promise.all([getProducts]).then(() => {
            const writerExport = csvWriter({})

            writerExport.pipe(fs.createWriteStream('neworders.csv'));

            data.map((i)=>{
                let count = 0;
                i.arr.map((a, index)=>{
                    index++;
                    count++;
                    // loop over keys and values
                    Object.entries(a).forEach(([key, value]) => {
                         i[`${key} - ${index}`] = value;
                    });

                });
                // console.log('count', count);
                delete i.arr;
            });


            /*Change arr*/
            var changeArray = data.map((item, index) => ({
                'First Name': item['First Name'],
                'Last Name': item['Last Name'],
                'Email Address': item['Email'],
                'Company': item['Company'],
                'Phone': item['Phone'],
                'Notes': item['Note']

            }))

            /*Write CSV*/
            data.map((el)=>{
                writerExport.write(el);
            })

        });
    }
    res.sendFile(__dirname + '/completion.html');
})

app.get('/download', function (req, res, next) {
    res.download(__dirname + '/neworders.csv', 'neworders.csv');
});

app.listen(3000 || process.env.PORT, () => {
  console.log("Server on...");
})