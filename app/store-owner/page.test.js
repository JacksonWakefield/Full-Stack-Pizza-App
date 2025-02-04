import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import StoreOwner from './page';  // adjust the path as needed
import React from 'react';
import '@testing-library/jest-dom';

// Mocking the fetch API call
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ name: 'Pepperoni' }, { name: 'Olives' }]),
  })
);

describe('StoreOwner Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  //POST topping test
  it('adds topping', async () => {
    render(<StoreOwner />);

    //Skip loading screen
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const addButton = screen.getByText(/add topping/i);  // Button text is "Add Topping"
    
    // Click the "Add Topping" button to show the input field
    fireEvent.click(addButton);

    // Wait for the input field to appear (since it's dynamically rendered)
    const inputField = await screen.findByPlaceholderText('Enter topping name');

    // Simulate user typing "pepperoni" into the input ("p" uncapitalized)
    fireEvent.change(inputField, { target: { value: 'pepperoni' } });

    // Wait for the input value to be updated
    await waitFor(() => {
      expect(inputField.value).toBe('pepperoni');
    });

    // Simulate the submit button click for adding the topping
    const submitButton = screen.getByText(/submit/i);
    fireEvent.click(submitButton);

    // Wait for the table to be updated and check that "pepperoni" is in the input field
    const addedToppingInput = await screen.findByDisplayValue('pepperoni'); // Check for the input field with the value "pepperoni"
    expect(addedToppingInput).toBeInTheDocument();
  });

  //DELETE topping test
  it('deletes topping', async () => {
    render(<StoreOwner />);

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

  //UPDATE topping test
  it('updates topping', async () => {
    render(<StoreOwner />)

    //Skip loading screen
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    // Wait for the input field to appear (since it's dynamically rendered)
    const inputField = await screen.getByDisplayValue(/Olives/i);

    const toppingRow = inputField.closest('tr');
    const updateButton = within(toppingRow).getByText(/update/i); 

    // Simulate user typing "olives" into the input ("o" uncapitalized)
    fireEvent.change(inputField, { target: { value: 'olives' } });

    // Wait for the input value to be updated
    await waitFor(() => {
        expect(inputField.value).toBe('olives');
      });

    await act(async () => {
        fireEvent.click(updateButton);
    });

    const updatedToppingInput = await screen.findByDisplayValue('olives'); // Check for the input field with the value "pepperoni"
    expect(updatedToppingInput).toBeInTheDocument();
  });
});
