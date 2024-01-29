const Data = require("../model/data.model");

const { sendEmail } = require("./email.controller");

module.exports = {
    newRecord: async (req, res) => {
        const data = req.body;
        if (data.lpg >= 150 || data.co >= 2000 || data.smoke >= 10000) {
            data.status = "Warning";
            const content = "Hey, your house will booommmmm soon, please check now :)))). This is auto message was sent by system.";
            const data1 = {
                to: "kiyanorin@gmail.com",
                subject: "Warning Gas Detection",
                html: content,
                text: "Hellooo",
            };
            sendEmail(data1);

        }
        let newRecord = await Data.create(data);
        res.json(newRecord);
    },
    getAllRecord: async (req, res) => {
        let records = await Data.find();
        res.send(records);
    },
    getRecord: async (req, res) => {
        const { id } = req.params;
        let record = await Data.findById(id);
        res.json(record);
    }
}