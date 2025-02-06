"use client"

import React, { useState, useEffect, use } from 'react';

export default function PizzaChef() {

    /////////////////////
    /* State and Style */
    /////////////////////

    // State for data
    const [pizzas, setPizzas] = useState([]); // Big List o' Pizzas
    const [pizzaToppings, setPizzaToppings] = useState([]); // List of pizza-topping relationships
    const [currentDisplayPizza, setCurrentDisplayPizza] = useState({}); // Designates which pizza-topping relationships are shown in table
    const [shouldDisplayPizza, setShouldDisplayPizza] = useState(false); // Flag to show pizza details - is read only in big PizzaChef return

    // State for the boring stuff
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newPizza, setNewPizza] = useState(''); // New pizza name input
    const [oldPizza, setOldPizza] = useState(''); // Old pizza name for editing
    const [deletePizza, setDeletePizza] = useState(''); // Pizza name for deletion
    const [isAdding, setIsAdding] = useState(false); // Flag to show pizza adding state
    const [isAddingTopping, setIsAddingTopping] = useState(false); // Flag to show topping adding state - is read only in big PizzaChef return

    const [selectedTopping, setSelectedTopping] = useState(""); // Topping selected from dropdown
    const [availableToppings, setAvailableToppings] = useState([]); // List of available toppings

    const [duplicateError_Pizza, setDuplicateError_Pizza] = useState(''); // Duplicate error message - pizza

    const tableStyle = "border border-gray-300 p-2"; // Styling for table cells

    /////////////
    /* backend */
    /////////////

    // Fetch pizza data, toppings, and available toppings on component mount
    useEffect(() => {
        async function fetchPizzas() {
            try {
                const res = await fetch('https://coherent-snipe-nearby.ngrok-free.app/pizza/', {
                    method: 'GET',
                    headers: new Headers({
                        "ngrok-skip-browser-warning": "69420", //required on all GET calls due to ngrok proxy
                    })
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch pizza');
                }
                const data = await res.json();
                setPizzas(data); // Update state with fetched pizzas
            } catch (error) {
                setError(error.message); // Handle fetch error
                console.error('Fetch failed on resource: pizza/:', error);
            } finally {
                setLoading(false); // Set loading to false after fetch completion
            }
        }

        async function fetchToppings() {
            try {
                const res = await fetch('https://coherent-snipe-nearby.ngrok-free.app/pizza/pizzatoppings/', {
                    method: 'GET',
                    headers: new Headers({
                        "ngrok-skip-browser-warning": "69420",//required on all GET calls due to ngrok proxy
                    })
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch toppings');
                }
                const data = await res.json();
                setPizzaToppings(data); // Update pizza toppings state
            } catch (error) {
                setError(error.message); // Handle fetch error
                console.error('Fetch failed on resource: toppings/:', error);
            } finally {
                setLoading(false); // Set loading to false after fetch completion
            }
        }

        async function fetchAvailableToppings() {
            try {
                const res = await fetch('https://coherent-snipe-nearby.ngrok-free.app/toppings/', {
                    method: 'GET',
                    headers: new Headers({
                        "ngrok-skip-browser-warning": "69420", //required on all GET calls due to ngrok proxy
                    })
                });
                const data = await res.json();
                setAvailableToppings(data); // Update available toppings state
            } catch (error) {
                setError(error.message); // Handle fetch error
                console.error('Fetch failed on resource: toppings/:', error);
            } finally {
                setLoading(false); // Set loading to false after fetch completion
            }
        }

        fetchPizzas(); // Call function to fetch pizzas
        fetchToppings(); // Call function to fetch pizza toppings
        fetchAvailableToppings(); // Call function to fetch available toppings
    }, []); // Empty dependency array means this effect runs only once on mount

    // Handle click to show pizza adding state
    const handleAddPizzaClick = () => {
        setIsAdding(true); // Show the text box for adding new pizza
    };

    // Handle click to show topping adding state
    const handleAddToppingClick = () => {
        setIsAddingTopping(true); // Show the dropdown for adding topping
    }

    // Handle input change for new pizza
    const handleInputChange = (e) => {
        setNewPizza(e.target.value); // Update new pizza name
    };

    // Handle dropdown change to add topping to selected pizza
    const handleDropdownChange = async (e) => {
        e.preventDefault();
        const selectedTopping = e.target.value; // Get the selected topping

        //Handle duplicates -- ADDED 2/6/2025
        if (currentDisplayPizza.toppings?.includes(selectedTopping)) {
            alert("This topping is already added to the current pizza."); // alert for this one instead of parsing columns
            return;
        }

        // If no topping is selected, do nothing
        if (!selectedTopping) return;

        // Add selected topping to currentDisplayPizza's toppings
        const updatedDisplayPizza = { ...currentDisplayPizza };
        if (!updatedDisplayPizza['toppings']) {
            updatedDisplayPizza['toppings'] = []; // Initialize toppings array if not already
        }
        updatedDisplayPizza['toppings'] = [...updatedDisplayPizza['toppings'], selectedTopping]; // Add new topping

        // Update pizzaToppings list in state
        let updatedPizzaList = [...pizzaToppings];

        // If pizza is not in pizzaToppings yet, add it
        if (!pizzaToppings.some(pizza => pizza.pizzaName === updatedDisplayPizza.pizzaName)) {
            updatedPizzaList.push(updatedDisplayPizza);
        } else {
            updatedPizzaList = pizzaToppings.map(pizza => {
                if (pizza.pizzaName === updatedDisplayPizza.pizzaName) {
                    return updatedDisplayPizza; // Update the pizza with new toppings
                }
                return pizza;
            });
        }

        // Update the pizzaToppings state
        setPizzaToppings(updatedPizzaList);
        setCurrentDisplayPizza(updatedDisplayPizza); // Update the displayed pizza

        // Reset the topping selection and hide the dropdown
        setSelectedTopping("");
        setIsAddingTopping(false);

        // Send the new topping to the backend
        const res = await fetch("https://coherent-snipe-nearby.ngrok-free.app/pizza/pizzatoppings/create/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pizzaName: updatedDisplayPizza['pizzaName'],
                toppingName: selectedTopping,
            }),
        });

        const data = await res.json();
        return data; // Return the response from the backend
    };

    // Handle form submission to create a new pizza
    const handleSubmitNewPizza = async (e) => {
        e.preventDefault();

        //Handle duplicates -- added 2/6
        if (checkDuplicates_Pizza(newPizza)) {
            setDuplicateError_Pizza('Pizza already exists.');
            return;
        }

        const res = await fetch("https://coherent-snipe-nearby.ngrok-free.app/pizza/create/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: newPizza}),
        });

        setPizzas([...pizzas, { name: newPizza }]); // Add new pizza to state
        setNewPizza(''); // Clear the input field
        setIsAdding(false); // Hide the adding state
    };

    // Handle pizza edit
    const handleEdit = (index, field, value) => {
        const updatedPizzas = [...pizzas];
        updatedPizzas[index][field] = value; // Update pizza field
        setPizzas(updatedPizzas); // Update pizzas state
        setNewPizza(value); // Set the new pizza name
    }

    // Handle focus on  for editing
    const handleFocus = (value) => {
        setOldPizza(value); // Set the old pizza name for editing
    }

    // Handle form submission to edit an existing pizza
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("https://coherent-snipe-nearby.ngrok-free.app/pizza/update/", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
              },          
            body: JSON.stringify({oldName: oldPizza, newName: newPizza})
        });

        setNewPizza(''); // Clear the new pizza input
        setOldPizza(''); // Clear the old pizza input

        const data = await res.json();
        return data;
    }

    // Handle pizza deletion
    const handleDelete = async (e, pizzaName) => {
        try {
            const res = await fetch("https://coherent-snipe-nearby.ngrok-free.app/pizza/delete/", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: pizzaName }), // Send pizza name to delete
            });
        
            if (res.ok) {
              setPizzas((prevPizzas) =>
                prevPizzas.filter((pizza) => pizza.name !== pizzaName) // Remove deleted pizza from state
              );
            }
          } catch (error) {
            console.error("Error deleting pizza:", error); // Log any errors during deletion
          }
    }

    // Returns true if pizza has a duplicate in the "pizzas" array -- Added 2/6
    const checkDuplicates_Pizza = (pizza) => {
        return pizzas.some(existingPizza => existingPizza.name.toLowerCase() === pizza.toLowerCase()); 
    };

    // Returns true if topping has a duplicate in the "pizzatoppings" array for current pizza -- Added 2/6
    const checkDuplicates_Toppings = (pizzaTopping) => {
        return pizzaToppings.some(existingTopping => {
            return existingTopping.toppingName.toLowerCase() === pizzaTopping.toLowerCase() && 
                   currentDisplayPizza.name === existingTopping.pizzaName;
        });
    };

    // Handle displaying pizza toppings
    const handleToppingsView = (_pizzaName) => {
        console.log(pizzaToppings.length);

        const pizzaWithToppings = pizzaToppings.find(({ pizzaName }) => pizzaName === _pizzaName); // Find the pizza in pizzaToppings state

        if (pizzaWithToppings) {
            setCurrentDisplayPizza(pizzaWithToppings); // Set the current pizza with toppings
        } else {
            setCurrentDisplayPizza({ pizzaName: _pizzaName, toppings: [] }); // Set default pizza with no toppings
        }

        setShouldDisplayPizza(true); // Set flag to display pizza
    };

    // Handle deleting a topping from a pizza
    const handleDeleteTopping = async (toppingToDelete) => {
        if (!toppingToDelete) return; // Prevent usage if no topping selected

        const updatedDisplayPizza = { ...currentDisplayPizza }; // Create copy of current pizza
        updatedDisplayPizza['toppings'] = updatedDisplayPizza['toppings'].filter(topping => topping !== toppingToDelete); // Remove topping

        setCurrentDisplayPizza(updatedDisplayPizza); // Update current displayed pizza

        const updatedPizzaList = pizzaToppings.map(pizza => {
            if (pizza.pizzaName === updatedDisplayPizza.pizzaName) {
                return updatedDisplayPizza; // Update the pizza list
            }
            return pizza;
        });

        setPizzaToppings(updatedPizzaList); // Update pizzaToppings state (ok, we're done updating)

        // Send delete request to backend
        const res = await fetch("https://coherent-snipe-nearby.ngrok-free.app/pizza/pizzatoppings/delete/", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pizzaName: updatedDisplayPizza['pizzaName'],
                toppingName: toppingToDelete,
            }),
        });

        const data = await res.json();
        return data; // Return the response from the backend
    };

    ///////////////////////////////////
    /* JSX and Loading/Error screens */
    ///////////////////////////////////

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="store-owner-wrapper w-full h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center w-full">
                <p className="pizzas-header text-4xl font-bold">Manage Pizzas</p>
                <button
                    onClick={handleAddPizzaClick}
                    className="bg-blue-500 text-white py-2 px-6 rounded"
                >
                    New Pizza
                </button>
            </div>

        <div className="overflow-x-auto">
            <table className="pizzas-table border table-auto w-full">
                <thead>
                    <tr>
                        <th className={tableStyle}>Pizza Name</th>
                        <th className={tableStyle}>Tools</th>
                    </tr>
                </thead>
                <tbody>
                    {pizzas.map((pizza, index) => (
                        <tr key={index}>
                            <td className={tableStyle}>
                                <input
                                    type="text"
                                    value={pizza.name}
                                    onChange={(e) => handleEdit(index, "name", e.target.value)}
                                    onFocus={(e) => handleFocus(e.target.value)}
                                    className="border p-2 w-full"
                                />
                            </td>
                            <td className={tableStyle}>
                                <div className="flex space-x-2 justify-center">
                                    <button
                                        className="bg-blue-500 text-white py-2 px-4 rounded"
                                        onClick={handleEditSubmit}
                                    >
                                        Update
                                    </button>
                                    <button
                                        className="bg-red-500 text-white py-2 px-4 rounded"
                                        onClick={(e) => handleDelete(e, pizza.name)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="bg-green-500 text-white py-2 px-4 rounded"
                                        onClick={() => handleToppingsView(pizza.name)}
                                    >
                                        View/Edit Toppings
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {isAdding && (
                        <tr>
                            <td className={tableStyle}>
                                <input
                                    type="text"
                                    value={newPizza}
                                    onChange={handleInputChange}
                                    className="border p-2"
                                    placeholder="Enter pizza name"
                                />
                                {duplicateError_Pizza && (
                                    <div className="text-red-500 mt-1">{duplicateError_Pizza}</div>  // Display error message
                                )}
                            </td>
                            <td className={tableStyle}>
                                <button
                                    onClick={handleSubmitNewPizza}
                                    className="bg-green-500 text-white py-2 px-4 rounded"
                                >
                                    Submit
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {shouldDisplayPizza && (
            <div className="overflow-x-auto">
                <table className="pizzas-table border table-auto w-full">
                    <thead>
                        <tr>
                            <th colSpan="100%" className={tableStyle}>
                                {currentDisplayPizza['pizzaName']} Toppings:
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {currentDisplayPizza['toppings']?.length > 0 ? (
                                currentDisplayPizza['toppings'].map((topping, index) => (
                                    <td key={index} className={tableStyle}>
                                        {topping}
                                        <br />
                                        <button
                                            onClick={() => handleDeleteTopping(topping)}
                                            className="bg-red-500 text-white py-1 px-2 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                ))
                            ) : (
                                <td colSpan="100%" className={tableStyle}>
                                    No toppings added
                                </td>
                            )}
                            {isAddingTopping && (
                                <td className={tableStyle}>
                                    <select
                                        value={selectedTopping}
                                        onChange={handleDropdownChange}
                                        className="border p-2 rounded w-full"
                                    >
                                        <option value="">Select a topping</option>
                                        {availableToppings.map((topping, index) => (
                                            <option key={index} value={topping['name']}>
                                                {topping['name']}
                                            </option>
                                        ))}
                                    </select>
                                    
                                </td>
                            )}
                            <td className={tableStyle}>
                                <button
                                    onClick={handleAddToppingClick}
                                    className="bg-blue-500 text-white py-2 px-4 rounded w-full"
                                >
                                    Add Topping
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )}
    </div>

    );
}