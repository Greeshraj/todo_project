import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";
import "./homepage.css";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Homepage() {
  // const [todo, setTodo] = useState("");
  const [todo, setTodo] = useState({
    task: "",       // Task title
    description: "", // Task description
    uidd: "" ,
    optionValue:""        // Unique identifier
  });
  const [todos, setTodos] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUidd, setTempUidd] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        // read
        onValue(ref(db, `/${auth.currentUser.uid}`), (snapshot) => {
          setTodos([]);
          const data = snapshot.val();
          if (data !== null) {
            Object.values(data).map((todo) => {
              setTodos((oldArray) => [...oldArray, todo]);
            });
          }
        });
      } else if (!user) {
        navigate("/");
      }
    });
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  // add
  const writeToDatabase = () => {
    const uidd = uid();
    set(ref(db, `/${auth.currentUser.uid}/${uidd}`), {
      task: todo.task,
      description: todo.description,
      uidd: uidd,
      optionValue:todo.optionValue
    });

    setTodo({
      task: "",
      description: "",
      uidd: "",
      optionValue:""
    });
  };


  // update
  const handleUpdate = (task) => {
    setIsEdit(true);
    setTodo({
      task: task.task,
      description: task.description, // Set the description for the specific task
      uidd: task.uidd,
      optionValue:task.optionValue
    });
  };



  const handleEditConfirm = () => {
    update(ref(db, `/${auth.currentUser.uid}/${tempUidd}`), {
      todo: todo,
      tempUidd: tempUidd
    });

    setTodo("");
    setIsEdit(false);
  };

  // delete
  const handleDelete = (uid) => {
    remove(ref(db, `/${auth.currentUser.uid}/${uid}`));
  };
  const colorchanger=()=>{
    console.log("ok")
  }

  return (
    <div className="homepage">

      <div className="todo2">
        <input
          className="add-edit-input"
          type="text"
          placeholder="Add task..."
          value={todo.task}
          onChange={(e) => setTodo({ ...todo, task: e.target.value })}
        />
        <input
          className="add-edit-input"
          type="text"
          placeholder="Add description..."
          value={todo.description}
          onChange={(e) => setTodo({ ...todo, description: e.target.value })}
        />
        <div className="select">
          <label htmlFor="">Completed </label>
        <select value={todo.optionValue} onChange={(e) => setTodo({ ...todo, optionValue: e.target.value })}>
        <option value="No" >No</option>
        <option value="Yes">Yes</option>
        
      </select>
        </div>
        <AddIcon onClick={writeToDatabase} className="add-button" />
      </div>


      {todos.map((task) => (
        <div className={task.optionValue == 'Yes' ? 'yestodo' : 'notodo'} key={task.uidd}>
           
          <h1>{task.task}</h1>
          <EditIcon
            fontSize="large"
            onClick={() => {
              handleUpdate(task);
              handleDelete(task.uidd);
            }}
            className="edit-button"
          />
          <DeleteIcon
            fontSize="large"
            onClick={() => handleDelete(task.uidd)}
            className="delete-button"
          />
          
          <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target={`#exampleModal-${task.description}`}> Desc </button>

          <div class="modal fade" id={`exampleModal-${task.description}`}  data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-body">
                  {task.description}
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      ))}


        <button fontSize="large" onClick={handleSignOut} className="logout-icon">SIGN OUT</button>
    </div>
  );
}