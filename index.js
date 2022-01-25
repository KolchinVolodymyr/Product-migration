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
                var combinedItems = jsonObj.reduce(function(arr, item, index) {
                var found = false;
//                    console.log('arr[i].Handle', item.Handle);
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].Handle === item.Handle) {
//                        console.log('arr[i]', arr[i].Title);
                        found = true;
                        arr[i].count++;
                         console.log('arr[i]', arr[i].arr)
                         console.log('arr[i]', arr[i].Title)
                        arr[i].arr.push({
                            'Variant Inventory Qty': item['Variant Inventory Qty']
                        })
                    }
                }
                if (!found) {
                    item.arr = [{
                        'Variant Inventory Qty': item['Variant Inventory Qty']
                    }]
                    item.count = 1;
                    arr.push(item);
                    data.push(arr[i]);
                }

                arr.push(item);
                return arr;
                }, [])

            });

        Promise.all([getProducts]).then(() => {
        console.log('data', data)
            const writerExport = csvWriter({})

//            writerExport.pipe(fs.createWriteStream('neworders.csv'));

//            data.map((i)=>{
//                let count = 0;
//                i.arr.map((a, index)=>{
//                    index++;
//                    count++;
//                    // loop over keys and values
//                    Object.entries(a).forEach(([key, value]) => {
//                         i[`${key} - ${index}`] = value;
//                    });
//
//                });
//                // console.log('count', count);
//                delete i.arr;
//            });


//            /*Change arr*/
//            var changeArray = data.map((item, index) => ({
//                'First Name': item['First Name'],
//                'Last Name': item['Last Name'],
//                'Email Address': item['Email'],
//                'Company': item['Company'],
//                'Phone': item['Phone'],
//                'Notes': item['Note']
//
//            }))
//
//            /*Write CSV*/
//            data.map((el)=>{
//                writerExport.write(el);
//            })

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