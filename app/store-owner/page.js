"use client"

import React, { useState, useEffect } from 'react';

export default function StoreOwner() {

    /////////////////////
    /* State and Style */
    /////////////////////
    
    // State for data   
    const [toppings, setToppings] = useState([]);

    // State for back and front-end display
    const [newTopping, setNewTopping] = useState('');
    const [oldTopping, setOldTopping] = useState('');
    const [deleteTopping, setDeleteTopping] = useState('');
    const [isAdding, setIsAdding] = useState(false); // Track if we are in adding state
    const [isEditing, setIsEditing] = useState(false); // Track if we are in editing state

    // Error and loading state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [duplicateError, setDuplicateError] = useState(''); // Error for duplicate toppings

    const tableStyle = "border border-gray-300 p-2";

    // Fetch toppings data when the component mounts
    useEffect(() => {
        // Function to fetch toppings from API
        async function fetchToppings() {
            try {
                const res = await fetch('https://coherent-snipe-nearby.ngrok-free.app/toppings/', {
                    method: 'GET',
                    headers: new Headers({
                        "ngrok-skip-browser-warning": "69420",
                    })
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch toppings');
                }
                const data = await res.json();
                setToppings(data);
            } catch (error) {
                setError(error.message); // Set error message in case it fails
                console.error('Fetch failed on resource: toppings/:', error);
            } finally {
                setLoading(false); 
            }
        }

        fetchToppings(); 
    }, []);

    // Handle text-box update
    const handleAddToppingClick = () => {
        setIsAdding(true); // Show the text box for adding new topping
        setDuplicateError(''); // Reset duplicate error
    };

    // Update the new topping state when input changes
    const handleInputChange = (e) => {
        setNewTopping(e.target.value); // Update the new topping text
        setDuplicateError(''); // Clear any previous duplicate error
    };

    // Handle the submission of a new topping to the backend
    const handleSubmitNewTopping = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        //Check duplicates -- Added
        if (checkDuplicates(newTopping)) {
            setDuplicateError('Topping already exists.'); // Set duplicate error
            return;
        }

        // Make a POST request to create the new topping
        const res = await fetch("https://coherent-snipe-nearby.ngrok-free.app/toppings/create/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newTopping }),
        });

        if (res.ok) {
            setToppings([...toppings, { name: newTopping }]); // Add new topping to the state
            setNewTopping(''); // Clear input after submission
            setIsAdding(false); // Hide the input box after adding topping
        }
    };

    // Function to edit the topping name in the table
    const handleEdit = (index, field, value) => {
        const updatedToppings = [...toppings];
        updatedToppings[index][field] = value; // Update specific field (name) in the toppings array
        setToppings(updatedToppings); // Update the toppings state
        setNewTopping(value); // Update the new topping value
    };

    // Set old topping value on focus for tracking changes
    const handleFocus = (value) => {
        setOldTopping(value); // Store old value before editing
    };

    // Submit the edit for topping name change
    const handleEditSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Make PUT request to update topping name in the backend
        const res = await fetch("https://coherent-snipe-nearby.ngrok-free.app/toppings/update/", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },          
            body: JSON.stringify({ oldName: oldTopping, newName: newTopping }) // Send old and new name to update
        });

        setNewTopping(''); // Clear the input field
        setOldTopping(''); // Reset old topping value

        if(!res.ok){
            alert("Could not edit topping - topping is either used in an exisiting pizza or is a duplicate of another existing topping. Please try again.");
            return;
        }

        const data = await res.json(); // Handle response from API
        return data;
    };

    // Handle deletion of topping from both UI and backend
    const handleDelete = async (e, toppingName) => {
        try {
            const res = await fetch("https://coherent-snipe-nearby.ngrok-free.app/toppings/delete/", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: toppingName }), // Send the topping name to delete
            });

            if (res.ok) {
              setToppings((prevToppings) =>
                prevToppings.filter((topping) => topping.name !== toppingName) // Remove the topping from the UI
              );
            }
          } catch (error) {
            console.error("Error deleting topping:", error); // Log error if deletion fails
          }
    };

    // Returns true if topping has a duplicate in the "toppings" array -- Added 2/6
    const checkDuplicates = (topping) => {
        return toppings.some(existingTopping => existingTopping.name.toLowerCase() === topping.toLowerCase()); 
    };

    // If data is still loading, show loading message
    if (loading) {
        return <div>Loading...</div>;
    }

    // If an error occurred, show error message
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="store-owner-wrapper w-full h-full">
            <p className="toppings-header text-4xl font-bold">Manage Toppings</p>
            <button
                onClick={handleAddToppingClick}
                className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
            >
                Add Topping
            </button>
            <table className="toppings-table border">
                <tbody>
                    <tr>
                        <th className={tableStyle}>Topping Name</th>
                        <th className={tableStyle}>Tools</th>
                    </tr>
                    {toppings.map((topping, index) => (
                        <tr key={index}>
                            <td className={tableStyle}>
                            <input
                                type="text"
                                value={topping.name}
                                onChange={(e) => handleEdit(index, "name", e.target.value)} // Update topping name
                                onFocus={(e) => handleFocus(e.target.value)} // Set focus to old value
                                className="border p-1 w-full"
                            />
                            </td>
                                <td className={tableStyle}>
                                    <button className="bg-blue-500 text-white py-2 px-4 rounded mx-4 my-2" onClick={handleEditSubmit}>Update</button>
                                    <button className="bg-red-500 text-white py-2 px-4 rounded mx-4 my-2" onClick={(e) => handleDelete(e, topping.name)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    {isAdding && (
                        <tr>
                            <td className={tableStyle}>
                                <input
                                    type="text"
                                    value={newTopping}
                                    onChange={handleInputChange} // Update new topping name
                                    className="border p-2"
                                    placeholder="Enter topping name"
                                />
                                {duplicateError && (
                                    <div className="text-red-500 mt-1">{duplicateError}</div>
                                )}
                            </td>
                            <td className={tableStyle}>
                                <button onClick={handleSubmitNewTopping} className="bg-green-500 text-white py-2 px-4 rounded">
                                    Submit
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
