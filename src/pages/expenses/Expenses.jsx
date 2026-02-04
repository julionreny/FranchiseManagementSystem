import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/Sidebar";

export default function Expenses()
{
    return(
         <div className="dashboard-container">
      <Sidebar/>
      <div className="dashboard-main">
        <Navbar/>
        <div className="dashboard-content">
          <h1>expenses</h1>
        </div>
      </div>
    </div>
    )

}