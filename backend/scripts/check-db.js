const db = require("../config/db");
async function checkSchema() {
    try {
        const sales = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'sales'");
        console.log("SALES_COLUMNS:" + sales.rows.map(r => r.column_name).join(","));
        
        const expenses = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'expenses'");
        console.log("EXPENSES_COLUMNS:" + expenses.rows.map(r => r.column_name).join(","));
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkSchema();
