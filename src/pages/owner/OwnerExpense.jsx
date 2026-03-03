import { useEffect, useState } from "react";

import { getOwnerExpenses }
from "../../services/ownerExpenseService";

import "../expenses/Expenses.css";


const OwnerExpense = () => {

  const user =
    JSON.parse(localStorage.getItem("user"));

  const franchiseId =
    user?.franchise_id;

  console.log("👤 User from localStorage:", user);
  console.log("🏢 franchise_id extracted:", franchiseId);

  const [expenses, setExpenses] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [type, setType] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);



  useEffect(() => {

    if (franchiseId) {
      fetchExpenses();
    } else {
      console.warn("No franchise ID found");
    }

  }, [franchiseId]);



  const fetchExpenses = async () => {

    if (!franchiseId) return;

    setLoading(true);
    setError(null);

    try {

      const data =
        await getOwnerExpenses(franchiseId);

      setExpenses(data || []);
      console.log("Owner expenses loaded:", data);

    }
    catch (err) {

      console.error("Error fetching owner expenses:", err);
      setError(err.message || "Failed to fetch expenses");

    }
    finally {
      setLoading(false);
    }

  };



  const filtered =
    expenses.filter(exp => {

      const matchSearch =
        exp.branch_location.toLowerCase()
        .includes(search.toLowerCase()) ||

        exp.expense_type.toLowerCase()
        .includes(search.toLowerCase());


      const matchType =
        type === "" ||
        exp.expense_type === type;


      const matchFrom =
        fromDate === "" ||
        exp.expense_date >= fromDate;


      const matchTo =
        toDate === "" ||
        exp.expense_date <= toDate;


      return matchSearch && matchType && matchFrom && matchTo;

    });



  const total =
    filtered.reduce(
      (sum, e) =>
      sum + Number(e.amount),
      0
    );



  return (

    <div className="expenses-page">

      <div className="expenses-header">

        <h1>Franchise Expenses</h1>

      </div>

      {!franchiseId && (
        <div style={{
          padding: "20px",
          color: "red",
          textAlign: "center"
        }}>
          No franchise ID found. Please log in again.
        </div>
      )}

      {error && (
        <div style={{
          padding: "20px",
          color: "red",
          textAlign: "center"
        }}>
          Error: {error}
        </div>
      )}

      {loading && (
        <div style={{
          padding: "20px",
          textAlign: "center"
        }}>
          Loading expenses...
        </div>
      )}

      {!loading && franchiseId && (
        <>
          <div className="expenses-controls">

            <input
              placeholder="Search"
              value={search}
              onChange={
                e =>
                setSearch(e.target.value)
              }
            />



            <select
              value={type}
              onChange={
                e =>
                setType(e.target.value)
              }
            >

              <option value="">
                All Types
              </option>

              {
                [...new Set(
                  expenses.map(
                    e => e.expense_type
                  )
                )]

                .map(type => (

                  <option key={type}>
                    {type}
                  </option>

                ))
              }

            </select>



            <input
              type="date"
              value={fromDate}
              onChange={
                e =>
                setFromDate(e.target.value)
              }
            />



            <input
              type="date"
              value={toDate}
              onChange={
                e =>
                setToDate(e.target.value)
              }
            />



            <div className="total">

              Total:
              ₹
              {total.toLocaleString()}

            </div>

          </div>



          <div className="expenses-table">

            {filtered.length === 0 ? (
              <div style={{
                padding: "20px",
                textAlign: "center",
                color: "#666"
              }}>
                No expenses found
              </div>
            ) : (
              <table>

                <thead>

                  <tr>

                    <th>
                      Branch Location
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Description
                    </th>

                  </tr>

                </thead>



                <tbody>

                  {filtered.map(exp => (

                    <tr key={exp.expense_id}>

                      <td>
                        {exp.branch_location}
                      </td>

                      <td>
                        {exp.expense_type}
                      </td>

                      <td>
                        ₹{exp.amount}
                      </td>

                      <td>
                        {exp.expense_date}
                      </td>

                      <td>
                        {exp.description}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>
            )}

          </div>
        </>
      )}

    </div>

  );

};


export default OwnerExpense;