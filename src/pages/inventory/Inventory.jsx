import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/Sidebar";

export default function Inventory()
{
    return(
         <div className="dashboard-container">
      <Sidebar/>
      <div className="dashboard-main">
        <Navbar/>
        <div className="dashboard-content">
          <h1>inventory</h1>
        </div>
      </div>
    </div>
    )

}