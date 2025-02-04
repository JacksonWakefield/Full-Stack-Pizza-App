import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import PizzaChef from './page';  // adjust the path as needed
import React from 'react';
import '@testing-library/jest-dom';

//Mock api calls
global.fetch = jest.fn((url) => {
    if (url.includes('/pizza')) {
      // First fetch call for toppings
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ name: 'Hawaiian' }, { name: 'Pepperoni' }]), 
      });
    }

    
    if (url.includes('/pizza/pizzatoppings')) {
      // Second fetch call for cheeses
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
            { 
                pizzaName: 'Hawaiian',
                toppings: ['Tomato Sauce', 'Cheese', 'Pineapple']
            }, 
            { 
                pizzaName: 'Pepperoni',
                toppings: ['Tomato Sauce', 'Cheese', 'Pepperoni']
            }
        ]),
      });
    }
    
    if (url.includes('/toppings')) {
      // Third fetch call for sauces
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ name: 'Tomato Sauce' }, { name: 'Cheese' }, { name: 'Pepperoni' }, { name: 'Pineapple' }]),
      });
    }
});

describe('PizzaChef Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  //POST pizza test
  it('adds pizza', async () => {
    render(<PizzaChef />);

    //Skip loading screen
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const addButton = screen.getByText(/new pizza/i);  // Button text is "Add Topping"
    
    // Click the "New Pizza" button to show the input field
    fireEvent.click(addButton);

    // Wait for the input field to appear (since it's dynamically rendered)
    const inputField = await screen.findByPlaceholderText('Enter pizza name');

    // Simulate user typing "pepperoni" into the input ("p" uncapitalized)
    fireEvent.change(inputField, { target: { value: 'BBQ' } });

    // Wait for the input value to be updated
    await waitFor(() => {
      expect(inputField.value).toBe('BBQ');
    });

    // Simulate the submit button click for adding the topping
    const submitButton = screen.getByText(/submit/i);
    fireEvent.click(submitButton);

    // Wait for the table to be updated and check that "pepperoni" is in the input field
    const addedToppingInput = await screen.findByDisplayValue('BBQ'); // Check for the input field with the value "pepperoni"
    expect(addedToppingInput).toBeInTheDocument();
  });

  //DELETE topping test
  it('deletes pizza', async () => {
    render(<PizzaChef />);

    //Skip loading screen
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    // Find delete button within the correct row
    const toppingRow = screen.getByDisplayValue(/Pepperoni/i).closest('tr');
    const delButton = within(toppingRow).getByText(/delete/i); 

    await act(async () => {
        fireEvent.click(delButton);
    });

    // Wait for the table to be updated and check that "pepperoni" is in the input field
    expect(screen.queryByText(/Pepperoni/i)).not.toBeInTheDocument();
  });

  //UPDATE pizza test
  it('updates pizza name', async () => {
    render(<PizzaChef />)

    //Skip loading screen
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    // Wait for the input field to appear (since it's dynamically rendered)
    const inputField = await screen.getByDisplayValue(/Hawaiian/i);

    const toppingRow = inputField.closest('tr');
    const updateButton = within(toppingRow).getByText(/update/i); 

    // Simulate user typing "olives" into the input ("o" uncapitalized)
    fireEvent.change(inputField, { target: { value: 'GrossPizza' } });

    // Wait for the input value to be updated
    await waitFor(() => {
        expect(inputField.value).toBe('GrossPizza');
      });

    await act(async () => {
        fireEvent.click(updateButton);
    });

    const updatedToppingInput = await screen.findByDisplayValue('GrossPizza'); // Check for the input field with the value "pepperoni"
    expect(updatedToppingInput).toBeInTheDocument();
  });

  //POST pizzatopping test
  it('adds topping to pizza (pizzatopping)', async () => {
    render(<PizzaChef />);

    //Skip loading screen
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    // Wait for the input field to appear (since it's dynamically rendered)
    const inputField_pizza = await screen.getByDisplayValue(/Hawaiian/i);

    const toppingRow = inputField_pizza.closest('tr');
    const updateButton = within(toppingRow).getByText(/View\/Update Toppings/i); // Button text is "View/Update Toppings"
    
    // Click the "View/Update Toppings" button to show the pizzatoppings table
    fireEvent.click(updateButton);

    // Wait for the input field to appear (since it's dynamically rendered)
    const addButton = await screen.getByText(/Add Topping/);

    // Click the "Add Topping" button to show the input
    fireEvent.click(addButton);

    // Simulate user typing "pepperoni" into the input ("p" uncapitalized)
    fireEvent.change(inputField, { target: { value: 'BBQ' } });

    // Wait for the input value to be updated
    await waitFor(() => {
      expect(inputField.value).toBe('BBQ');
    });

    // Simulate the submit button click for adding the topping
    const submitButton = screen.getByText(/submit/i);
    fireEvent.click(submitButton);

    // Wait for the table to be updated and check that "pepperoni" is in the input field
    const addedToppingInput = await screen.findByDisplayValue('BBQ'); // Check for the input field with the value "pepperoni"
    expect(addedToppingInput).toBeInTheDocument();
  });

})
