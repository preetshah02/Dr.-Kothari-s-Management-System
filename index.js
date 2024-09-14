const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection to the database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Preetshah02',  // Change to your actual password
    database: 'prescription'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Function to fill form fields in the PDF
async function fillPrescriptionPDF(data, prescriptionId) {
    try {
        const pdfTemplatePath = path.join(__dirname, 'prescription_template.pdf');
        console.log(`Looking for PDF template at: ${pdfTemplatePath}`);

        if (!fs.existsSync(pdfTemplatePath)) {
            console.error('PDF template not found');
            throw new Error('PDF template not found');
        }

        const pdfBytes = fs.readFileSync(pdfTemplatePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();

        // Fill the fields with the correct data
        form.getTextField('Text1').setText(data.patientName);
        form.getTextField('Text4').setText(data.sex);
        form.getTextField('Text5').setText(data.age.toString());
        form.getTextField('Text6').setText(data.rightEyeSph1);
        form.getTextField('Text7').setText(data.rightEyeSph2);
        form.getTextField('Text9').setText(data.rightEyeCyl1);
        form.getTextField('Text8').setText(data.rightEyeCyl2);
        form.getTextField('Text10').setText(data.rightEyeAxis1);
        form.getTextField('Text11').setText(data.rightEyeAxis2);
        form.getTextField('Text12').setText(data.leftEyeSph1);
        form.getTextField('Text13').setText(data.leftEyeSph2);
        form.getTextField('Text14').setText(data.leftEyeCyl1);
        form.getTextField('Text17').setText(data.leftEyeCyl2);
        form.getTextField('Text18').setText(data.leftEyeAxis1);
        form.getTextField('Text19').setText(data.leftEyeAxis2);
        form.getTextField('Text20').setText(data.addForNear);
        form.getTextField('Text21').setText(data.prescriptionType);
        form.getTextField('Text2').setText(data.address);
        form.getTextField('Text22').setText(data.date);

        // Save the filled PDF to bytes
        const pdfBytesFilled = await pdfDoc.save();

        // Ensure the pdfs directory exists
        const pdfDirectory = path.join(__dirname, 'pdfs');
        if (!fs.existsSync(pdfDirectory)) {
            fs.mkdirSync(pdfDirectory);
        }

        // Save the filled PDF to a file
        const filledPdfPath = path.join(pdfDirectory, `prescription_${data.patientName}_${data.date}.pdf`);
        fs.writeFileSync(filledPdfPath, pdfBytesFilled);

        console.log(`PDF successfully generated and saved at: ${filledPdfPath}`);
        return filledPdfPath;

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;  // Rethrow the error so it can be caught in the route handler
    }
}

// Endpoint to save prescription data to the database and generate PDF
app.post('/save-prescription', async (req, res) => {
    const { 
        patientName, age, sex, address, rightEyeSph1, rightEyeSph2, rightEyeCyl1, rightEyeCyl2, 
        rightEyeAxis1, rightEyeAxis2, leftEyeSph1, leftEyeSph2, leftEyeCyl1, leftEyeCyl2, 
        leftEyeAxis1, leftEyeAxis2, addForNear, prescriptionType 
    } = req.body;

    const query = `
        INSERT INTO prescriptions 
        (patient_name, age, sex, address, right_eye_sph1, right_eye_sph2, right_eye_cyl1, right_eye_cyl2, 
        right_eye_axis1, right_eye_axis2, left_eye_sph1, left_eye_sph2, left_eye_cyl1, left_eye_cyl2, 
        left_eye_axis1, left_eye_axis2, add_for_near, prescription_type, date, pdf_path) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)
    `;

    try {
        const pdfPath = await fillPrescriptionPDF({
            patientName,
            age,
            sex,
            address,
            rightEyeSph1,
            rightEyeSph2,
            rightEyeCyl1,
            rightEyeCyl2,
            rightEyeAxis1,
            rightEyeAxis2,
            leftEyeSph1,
            leftEyeSph2,
            leftEyeCyl1,
            leftEyeCyl2,
            leftEyeAxis1,
            leftEyeAxis2,
            addForNear,
            prescriptionType,
            date: new Date().toISOString().split('T')[0] // Use today's date
        }, patientName); // Use patient's name for the PDF file

        connection.query(query, [
            patientName, age, sex, address, rightEyeSph1, rightEyeSph2, rightEyeCyl1, rightEyeCyl2, 
            rightEyeAxis1, rightEyeAxis2, leftEyeSph1, leftEyeSph2, leftEyeCyl1, leftEyeCyl2, 
            leftEyeAxis1, leftEyeAxis2, addForNear, prescriptionType, pdfPath
        ], (err, result) => {
            if (err) {
                console.error('Error saving prescription to database:', err);
                res.status(500).json({ message: 'Error saving prescription to database' });
                return;
            }

            res.json({ message: 'Prescription saved and PDF generated', pdfPath });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating PDF', error });
    }
});

// Endpoint to search for prescriptions and return the PDF file
app.get('/search-prescriptions', (req, res) => {
    const { searchQuery } = req.query;

    // Query to search for prescriptions by patient name
    const query = `
        SELECT * FROM prescriptions 
        WHERE patient_name LIKE ?;
    `;

    const searchValue = `%${searchQuery}%`;

    connection.query(query, [searchValue], (err, results) => {
        if (err) {
            console.error('Error searching for prescriptions:', err);
            res.status(500).json({ message: 'Error searching for prescriptions' });
            return;
        }

        // Send the PDF file with the result
        if (results.length > 0) {
            const prescription = results[0];
            const pdfPath = prescription.pdf_path;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="prescription_${prescription.patient_name}_${prescription.date}.pdf"`);

            const fileStream = fs.createReadStream(pdfPath);
            fileStream.pipe(res);
        } else {
            res.status(404).json({ message: 'No results found' });
        }
    });
});

// Start server
app.listen(4000, () => {
    console.log('Server running on port 4000');
});
