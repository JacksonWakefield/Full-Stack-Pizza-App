"use client"

import { useState, useEffect, use } from 'react';

export default function PizzaChef() {

    const [pizzas, setPizzas] = useState([]);
    const [pizzaToppings, setPizzaToppings] = useState([]);
    const [currentDisplayPizza, setCurrentDisplayPizza] = useState({});
    const [shouldDisplayPizza, setShouldDisplayPizza] = useState(false);


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newPizza, setNewPizza] = useState('');
    const [oldPizza, setOldPizza] = useState('');
    const [deletePizza, setDeletePizza] = useState('');
    const [isAdding, setIsAdding] = useState(false); // Track if we are in adding state
    const [isAddingTopping, setIsAddingTopping] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Track if we are in editing state

    const [selectedTopping, setSelectedTopping] = useState("");
    const [availableToppings, setAvailableToppings] = useState([]);


    

    const tableStyle = "border border-gray-300 p-2";

    // Fetch pizzas data when the component mounts
    useEffect(() => {
        async function fetchPizzas() {
            try {
                const res = await fetch('https://coherent-snipe-nearby.ngrok-free.app/pizza/');
                if (!res.ok) {
                    throw new Error('Failed to fetch pizza');
                }
                const data = await res.json();
                setPizzas(data);
            } catch (error) {
                setError(error.message);
                console.error('Fetch failed on resource: pizza/:', error);
            } finally {
                setLoading(false);
            }
        }

        async function fetchToppings() {
            try {
                const res = await fetch('https://coherent-snipe-nearby.ngrok-free.app/pizza/pizzatoppings/');
                if (!res.ok) {
                    throw new Error('Failed to fetch toppings');
                }
                const data = await res.json();
                setPizzaToppings(data);
            } catch (error) {
                setError(error.message);
                console.error('Fetch failed on resource: toppings/:', error);
            } finally {
                setLoading(false);
            }
        }

        async function fetchAvailableToppings() {
            try {
                const res = await fetch('https://coherent-snipe-nearby.ngrok-free.app/toppings/');
                if (!res.ok) {
                    throw new Error('Failed to fetch toppings');
                }
                const data = await res.json();
                setAvailableToppings(data);
            } catch (error) {
                setError(error.message);
                console.error('Fetch failed on resource: toppings/:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchPizzas();
        fetchToppings();
        fetchAvailableToppings();
    }, []);

    const handleAddPizzaClick = () => {
        setIsAdding(true); // Show the text box
    };

    const handleAddToppingClick = () => {
        setIsAddingTopping(true);
    }

    const handleInputChange = (e) => {
        setNewPizza(e.target.value); // Update the new pizza text
    };

    const handleDropdownChange = async (e) => {
        e.preventDefault();
    
        const selectedTopping = e.target.value;
    
        // If no topping is selected, do nothing
        if (!selectedTopping) return;
    
        // Add selected topping to currentDisplayPizza
        const updatedDisplayPizza = { ...currentDisplayPizza };
    
        // Ensure toppings array exists and add the new topping
        if (!updatedDisplayPizza['toppings']) {
            updatedDisplayPizza['toppings'] = []; // Initialize toppings array if it doesn't exist
        }
    
        updatedDisplayPizza['toppings'] = [...updatedDisplayPizza['toppings'], selectedTopping];
    
        // Check if the pizza exists in the pizzaToppings state; if not, add it
        let updatedPizzaList = [...pizzaToppings];
    
        // If pizza is not in pizzaToppings yet, add it
        if (!pizzaToppings.some(pizza => pizza.pizzaName === updatedDisplayPizza.pizzaName)) {
            updatedPizzaList.push(updatedDisplayPizza);
        } else {
            // If pizza exists, update the toppings for the pizza
            updatedPizzaList = pizzaToppings.map(pizza => {
                if (pizza.pizzaName === updatedDisplayPizza.pizzaName) {
                    return updatedDisplayPizza; // Update the pizza with the new toppings list
                }
                return pizza;
            });
        }
    
        // Set updated pizzaToppings state
        setPizzaToppings(updatedPizzaList);
    
        // Update the display pizza state to re-render
        setCurrentDisplayPizza(updatedDisplayPizza);
        console.log("Updated Display Pizza:", updatedDisplayPizza);
    
        // Reset the selected topping dropdown and hide it after selection
        setSelectedTopping("");
        setIsAddingTopping(false);
    
        // Send the selected topping to the backend if needed
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
        return data;
    };
    
    
    
    

    const handleSubmitNewPizza = async (e) => {
        e.preventDefault();

        const res = await fetch("https://coherent-snipe-nearby.ngrok-free.app/pizza/create/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: newPizza}),
        });

        setPizzas([...pizzas, { name: newPizza }]);
        setNewPizza('');
        setIsAdding(false);
    };

    const handleEdit = (index, field, value) => {
        const updatedPizzas = [...pizzas];
        updatedPizzas[index][field] = value;
        setPizzas(updatedPizzas);
        setNewPizza(value);
    }

    const handleFocus = (value) => {
        setOldPizza(value);
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("https://coherent-snipe-nearby.ngrok-free.app/pizza/update/", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
              },          
            body: JSON.stringify({oldName: oldPizza, newName: newPizza})
        })

        setNewPizza('');
        setOldPizza('');

        const data = await res.json();
        return data;
    }

    const handleDelete = async (e, pizzaName) => {
        try {
            const res = await fetch("https://coherent-snipe-nearby.ngrok-free.app/pizza/delete/", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: pizzaName }),
            });
        
            if (res.ok) {
              setPizzas((prevPizzas) =>
                prevPizzas.filter((pizza) => pizza.name !== pizzaName)
              );
            }
          } catch (error) {
            console.error("Error deleting pizza:", error);
          }
    }

    const handleToppingsView = (_pizzaName) => {
        console.log(pizzaToppings.length);
        
        // Find the pizza with updated toppings from pizzaToppings state
        const pizzaWithToppings = pizzaToppings.find(({ pizzaName }) => pizzaName === _pizzaName);
    
        if (pizzaWithToppings) {
            // Set the current display pizza with its toppings from pizzaToppings state
            setCurrentDisplayPizza(pizzaWithToppings);
        } else {
            // If no pizza is found in pizzaToppings, create a default with no toppings
            setCurrentDisplayPizza({ pizzaName: _pizzaName, toppings: [] });
        }
    
        // Set flag to display pizza details
        setShouldDisplayPizza(true);
    };

    const handleDeleteTopping = async (toppingToDelete) => {
        // Prevent if no topping is selected
        if (!toppingToDelete) return;
    
        // Create a copy of currentDisplayPizza to modify it
        const updatedDisplayPizza = { ...currentDisplayPizza };
    
        // Remove the selected topping from the toppings list
        updatedDisplayPizza['toppings'] = updatedDisplayPizza['toppings'].filter(topping => topping !== toppingToDelete);
    
        // Update currentDisplayPizza state with the new toppings list
        setCurrentDisplayPizza(updatedDisplayPizza);
    
        // Update pizzaToppings list to reflect the changes
        const updatedPizzaList = pizzaToppings.map(pizza => {
            if (pizza.pizzaName === updatedDisplayPizza.pizzaName) {
                return updatedDisplayPizza; // Update the pizza with the new toppings list
            }
            return pizza;
        });
    
        // Update pizzaToppings state
        setPizzaToppings(updatedPizzaList);
    
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
        return data;
    };




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