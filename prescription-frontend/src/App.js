import React, { useState } from 'react';
import axios from 'axios';
import './PrescriptionForm.css'; // Custom styling

function PrescriptionForm() {
    const [formData, setFormData] = useState({
        patientName: '',
        age: '',
        sex: '',
        address: '',
        rightEyeSph1: '',
        rightEyeSph2: '',
        rightEyeCyl1: '',
        rightEyeCyl2: '',
        rightEyeAxis1: '',
        rightEyeAxis2: '',
        leftEyeSph1: '',
        leftEyeSph2: '',
        leftEyeCyl1: '',
        leftEyeCyl2: '',
        leftEyeAxis1: '',
        leftEyeAxis2: '',
        addForNear: '',
        prescriptionType: '',
        date: ''
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Handle form changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/save-prescription', formData);
            setResponseMessage(response.data.message);
        } catch (error) {
            console.error('Error saving prescription:', error);
            setResponseMessage('Error saving prescription');
        }
    };

    // Handle search submit
    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get('http://localhost:4000/search-prescriptions', {
                params: { searchQuery }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching for prescriptions:', error);
        }
    };

    return (
        <div className="form-container">
            {/* Prescription Form */}
            <h2>Prescription Form</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <label>Patient's Name:</label>
                    <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} />
                </div>

                <div className="form-section">
                    <label>Sex:</label>
                    <select name="sex" value={formData.sex} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    <label>Age:</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} />
                </div>

                <div className="form-section">
                    <label>Address:</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} />
                </div>

                <div className="eye-table-container">
                    <h3>Prescription Details</h3>
                    <table className="eye-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th colSpan="3">Right Eye</th>
                                <th colSpan="3">Left Eye</th>
                            </tr>
                            <tr>
                                <th></th>
                                <th>Sp.</th>
                                <th>Cy.</th>
                                <th>Axis</th>
                                <th>Sp.</th>
                                <th>Cy.</th>
                                <th>Axis</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1st Row</td>
                                <td><input type="text" name="rightEyeSph1" value={formData.rightEyeSph1} onChange={handleChange} /></td>
                                <td><input type="text" name="rightEyeCyl1" value={formData.rightEyeCyl1} onChange={handleChange} /></td>
                                <td><input type="text" name="rightEyeAxis1" value={formData.rightEyeAxis1} onChange={handleChange} /></td>
                                <td><input type="text" name="leftEyeSph1" value={formData.leftEyeSph1} onChange={handleChange} /></td>
                                <td><input type="text" name="leftEyeCyl1" value={formData.leftEyeCyl1} onChange={handleChange} /></td>
                                <td><input type="text" name="leftEyeAxis1" value={formData.leftEyeAxis1} onChange={handleChange} /></td>
                            </tr>
                            <tr>
                                <td>2nd Row</td>
                                <td><input type="text" name="rightEyeSph2" value={formData.rightEyeSph2} onChange={handleChange} /></td>
                                <td><input type="text" name="rightEyeCyl2" value={formData.rightEyeCyl2} onChange={handleChange} /></td>
                                <td><input type="text" name="rightEyeAxis2" value={formData.rightEyeAxis2} onChange={handleChange} /></td>
                                <td><input type="text" name="leftEyeSph2" value={formData.leftEyeSph2} onChange={handleChange} /></td>
                                <td><input type="text" name="leftEyeCyl2" value={formData.leftEyeCyl2} onChange={handleChange} /></td>
                                <td><input type="text" name="leftEyeAxis2" value={formData.leftEyeAxis2} onChange={handleChange} /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="form-section">
                    <label>Add for Near:</label>
                    <input type="text" name="addForNear" value={formData.addForNear} onChange={handleChange} />
                </div>

                <div className="form-section">
                    <label>Prescription Type:</label>
                    <input type="text" name="prescriptionType" value={formData.prescriptionType} onChange={handleChange} />
                </div>

                <div className="form-section">
                    <label>Date:</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} />
                </div>

                <button type="submit" className="submit-btn">Save Prescription</button>
            </form>

            {responseMessage && <p>{responseMessage}</p>}

            {/* Search Form */}
            <h2>Search Prescriptions</h2>
            <form onSubmit={handleSearch}>
                <label>Search by Patient Name:</label>
                <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Enter patient name" 
                />
                <button type="submit" className="submit-btn">Search</button>
            </form>

            {/* Search Results */}
            <h3>Search Results</h3>
            {searchResults.length > 0 ? (
                searchResults.map((prescription) => (
                    <div key={prescription.id} className="prescription-result">
                        {/* Date as Header */}
                        <h4>Date: {new Date(prescription.date).toDateString()}</h4>
                        
                        {/* Patient Details */}
                        <p><strong>Name:</strong> {prescription.patient_name}</p>
                        <p><strong>Age:</strong> {prescription.age}</p>
                        <p><strong>Sex:</strong> {prescription.sex}</p>
                        <p><strong>Address:</strong> {prescription.address}</p>

                        {/* Prescription Details */}
                        <table className="eye-table">
                            <thead>
                                <tr>
                                    <th colSpan="3">Right Eye</th>
                                    <th colSpan="3">Left Eye</th>
                                </tr>
                                <tr>
                                    <th>Sp.</th>
                                    <th>Cy.</th>
                                    <th>Axis</th>
                                    <th>Sp.</th>
                                    <th>Cy.</th>
                                    <th>Axis</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{prescription.right_eye_sph1}</td>
                                    <td>{prescription.right_eye_cyl1}</td>
                                    <td>{prescription.right_eye_axis1}</td>
                                    <td>{prescription.left_eye_sph1}</td>
                                    <td>{prescription.left_eye_cyl1}</td>
                                    <td>{prescription.left_eye_axis1}</td>
                                </tr>
                                <tr>
                                    <td>{prescription.right_eye_sph2}</td>
                                    <td>{prescription.right_eye_cyl2}</td>
                                    <td>{prescription.right_eye_axis2}</td>
                                    <td>{prescription.left_eye_sph2}</td>
                                    <td>{prescription.left_eye_cyl2}</td>
                                    <td>{prescription.left_eye_axis2}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Additional Fields */}
                        <p><strong>Add for Near:</strong> {prescription.add_for_near}</p>
                        <p><strong>Prescription Type:</strong> {prescription.prescription_type}</p>
                    </div>
                ))
            ) : (
                <p>No results found</p>
            )}
        </div>
    );
}

export default PrescriptionForm;
