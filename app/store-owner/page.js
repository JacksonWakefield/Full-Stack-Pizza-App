"use client"

import { useState, useEffect } from 'react';

export default function StoreOwner() {
    const [toppings, setToppings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTopping, setNewTopping] = useState('');
    const [oldTopping, setOldTopping] = useState('');
    const [deleteTopping, setDeleteTopping] = useState('');
    const [isAdding, setIsAdding] = useState(false); // Track if we are in adding state
    const [isEditing, setIsEditing] = useState(false); // Track if we are in editing state

    const tableStyle = "border border-gray-300 p-2";

    // Fetch toppings data when the component mounts
    useEffect(() => {
        async function fetchToppings() {
            try {
                const res = await fetch('https://f0ac-52-53-194-129.ngrok-free.apptoppings/');
                if (!res.ok) {
                    throw new Error('Failed to fetch toppings');
                }
                const data = await res.json();
                setToppings(data);
            } catch (error) {
                setError(error.message);
                console.error('Fetch failed on resource: toppings/:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchToppings();
    }, []);

    const handleAddToppingClick = () => {
        setIsAdding(true); // Show the text box
    };

    const handleInputChange = (e) => {
        setNewTopping(e.target.value); // Update the new topping text
    };

    const handleSubmitNewTopping = async (e) => {
        e.preventDefault();

        const res = await fetch("https://f0ac-52-53-194-129.ngrok-free.apptoppings/create/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: newTopping}),
        });

        setToppings([...toppings, { name: newTopping }]);
        setNewTopping('');
        setIsAdding(false);
    };

    const handleEdit = (index, field, value) => {
        const updatedToppings = [...toppings];
        updatedToppings[index][field] = value;
        setToppings(updatedToppings);
        setNewTopping(value);
    }

    const handleFocus = (value) => {
        setOldTopping(value);
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("https://f0ac-52-53-194-129.ngrok-free.apptoppings/update/", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
              },          
            body: JSON.stringify({oldName: oldTopping, newName: newTopping})
        })

        setNewTopping('');
        setOldTopping('');

        const data = await res.json();
        return data;
    }

    const handleDelete = async (e, toppingName) => {
        try {
            const res = await fetch("https://f0ac-52-53-194-129.ngrok-free.apptoppings/delete/", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: toppingName }),
            });
        
            if (res.ok) {
              setToppings((prevToppings) =>
                prevToppings.filter((topping) => topping.name !== toppingName)
              );
            }
          } catch (error) {
            console.error("Error deleting topping:", error);
          }
    }




    if (loading) {
        return <div>Loading...</div>;
    }

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
                                onChange={(e) => handleEdit(index, "name", e.target.value)}
                                onFocus={(e) => handleFocus(e.target.value)}
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
                                    onChange={handleInputChange}
                                    className="border p-2"
                                    placeholder="Enter topping name"
                                />
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