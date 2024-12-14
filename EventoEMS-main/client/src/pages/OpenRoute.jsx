import { Navigate } from "react-router-dom"
import { UserContext } from "../UserContext";
import { useContext } from "react";

function OpenRoute({ children }) {
const {user} = useContext(UserContext);
console.log(user);
  if (user !== null) {
    return children
  } else {
    return <Navigate to="/register" />
  }
}

export default OpenRoute;