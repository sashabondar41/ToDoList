import React,{Component} from 'react';
import {variables} from './Variables.js';
import {Route, Switch, NavLink} from 'react-router-dom';
import { UserSaves } from './UserSaves.js';
import Swal from 'sweetalert2'

export class Tasks extends Component{

    constructor(props){
        super(props);

        this.state={
            tasks:[],
            modalTitle:"",
            TaskName:"",
            TaskId:0,
            TaskDescription:"",
            UserId:this.props.location.state["UserId"],
            ExpirationDate:"",
            saves:this.props.location.state["saves"],
            
            TaskIdFilter:"",
            TaskNameFilter:"",
            tasksWithoutFilter:[]
        }
    }

    FilterFn(){
        var TaskIdFilter=this.state.TaskIdFilter;
        var TaskNameFilter = this.state.TaskNameFilter;

        var filteredData=this.state.tasksWithoutFilter.filter(
            function(el){
                return el.TaskId.toString().toLowerCase().includes(
                    TaskIdFilter.toString().trim().toLowerCase()
                )&&
                el.TaskName.toString().toLowerCase().includes(
                    TaskNameFilter.toString().trim().toLowerCase()
                )
            }
        );

        this.setState({tasks:filteredData});

    }

    sortResult(prop,asc){
        var sortedData=this.state.tasksWithoutFilter.sort(function(a,b){
            if(asc){
                return (a[prop]>b[prop])?1:((a[prop]<b[prop])?-1:0);
            }
            else{
                return (b[prop]>a[prop])?1:((b[prop]<a[prop])?-1:0);
            }
        });

        this.setState({tasks:sortedData});
    }

    changeTaskIdFilter = (e)=>{
        this.state.TaskIdFilter=e.target.value;
        this.FilterFn();
    }
    changeTaskNameFilter = (e)=>{
        this.state.TaskNameFilter=e.target.value;
        this.FilterFn();
    }

    refreshList(){
        fetch(variables.API_URL+'task')
        .then(response=>response.json())
        .then(data=>{
            this.setState({tasks:data,tasksWithoutFilter:data});
        });
    }

    componentDidMount(){
        this.refreshList();
    }
    
    changeTaskName =(e)=>{
        this.setState({TaskName:e.target.value});
    }
    changeTaskDescription =(e)=>{
        this.setState({TaskDescription:e.target.value});
    }
    changeExpirationDate =(e)=>{
        this.setState({ExpirationDate:e.target.value});
    }

    addClick(){
        this.setState({
            modalTitle:"Add Task",
            TaskId:0,
            TaskName:"",
            TaskDescription:""
        });
    }
    editClick(tsk){
        this.setState({
            modalTitle:"Edit Task",
            TaskId:tsk.TaskId,
            TaskName:tsk.TaskName,
            TaskDescription:tsk.TaskDescription
        });
    }

    addUserTaskClick(tsk){
        this.setState({
            modalTitle:"Save task for user",
            TaskId:tsk.TaskId,
            TaskName:tsk.TaskName,
            TaskDescription:tsk.TaskDescription,
        })
    }

    saveUserTaskClick(){
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        if (this.state.saves.includes(this.state.TaskId)){
            Swal.fire(
                'Oops...',
                'You already have this task!',
                'error'
            );
        }else if (Date.parse(this.state.ExpirationDate) !== Date.parse(this.state.ExpirationDate)) {
            Swal.fire(
                'Oops...',
                'Empty date field!',
                'error'
            );
        }else if (Date.parse(this.state.ExpirationDate) < Date.parse(date)){
            Swal.fire(
                'Oops...',
                'You can\'t do things yesterday!',
                'error'
            );
        }else{
            fetch(variables.API_URL+'usertask',{
                method:'POST',
                headers:{
                    'Accept':'application/json',
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    UserId:this.state.UserId,
                    TaskId:this.state.TaskId,
                    ExpirationDate:this.state.ExpirationDate
                })
            })
            .then(res=>res.json())
            .then((result)=>{
                Swal.fire(
                    'Added!',
                    'User now have new task',
                    'success'
                );
                this.refreshList();
            },(error)=>{
                Swal.fire(
                    'Oops...',
                    'Something went wrong',
                    'error'
                );
            })
        }
    }

    createClick(){
        fetch(variables.API_URL+'task',{
            method:'POST',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                TaskName:this.state.TaskName,
                TaskDescription:this.state.TaskDescription
            })
        })
        .then(res=>res.json())
        .then((result)=>{
            Swal.fire(
                'Yahoo!',
                'New task has been created!',
                'success'
            );
            this.refreshList();
        },(error)=>{
            Swal.fire(
                'Oops...',
                'Something went wrong',
                'error'
            );
        })
    }


    updateClick(){
        fetch(variables.API_URL+'task',{
            method:'PUT',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                TaskId:this.state.TaskId,
                TaskName:this.state.TaskName,
                TaskDescription:this.state.TaskDescription
            })
        })
        .then(res=>res.json())
        .then((result)=>{
            Swal.fire(
                'Yes!',
                'Task has been updated',
                'success'
            );
            this.refreshList();
        },(error)=>{
            Swal.fire(
                'Oops...',
                'Something went wrong',
                'error'
            );
        })
    }

    deleteClick(id){
        Swal.fire({
            title: 'Are you sure?',
            showDenyButton: true,
            confirmButtonText: 'Yes!',
            denyButtonText: `No!`,
            icon:'question'
          }).then((result) => {
            if (result.isConfirmed) {
                fetch(variables.API_URL+'task/'+id,{
                    method:'DELETE',
                    headers:{
                        'Accept':'application/json',
                        'Content-Type':'application/json'
                    }
                })
                .then(res=>res.json())
                .then((result)=>{
                    Swal.fire(
                        'That\'s fine',
                        'Deleted successfully',
                        'success'
                    );
                    this.refreshList();
                },(error)=>{
                    Swal.fire(
                        'Oops...',
                        'Something went wrong',
                        'error'
                    );
                })
            } else if (result.isDenied) {
              Swal.fire(
                  'Action Denied', 
                  'It\'s always your choice', 
                  'info'
              )}
          })
        if(window.confirm('Are you sure?')){
        
        }
    }

    render(){
        const {
            tasks,
            modalTitle,
            TaskId,
            TaskName,
            TaskDescription,
            ExpirationDate
        }=this.state;

        return(
<div className='App container'>
    <NavLink
    className="btn btn-primary m-2 float-start" to={{
        pathname:"/user",
        state: this.state.UserId
    }}>
        To User's Task
    </NavLink>
    <button type="button"
    className="btn btn-primary m-2 float-end"
    data-bs-toggle="modal"
    data-bs-target="#exampleModal"
    onClick={()=>this.addClick()}>
        Add New Task
    </button>
    <table className="table table-hover">
    <thead className="thead-light">
    <tr>
        <th>    
        <div className="d-flex flex-row justify-content-center">
            <button type="button" className="btn btn-light"
            onClick={()=>this.sortResult('TaskId',true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                </svg>
            </button>

            <button type="button" className="btn btn-light"
            onClick={()=>this.sortResult('TaskId',false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
                </svg>
            </button>
        </div>
        <div className="d-flex flex-row justify-content-center">
            <input className="form-control m-2"
            onChange={this.changeTaskIdFilter}
            placeholder="Filter"/>
        </div>
            TaskId
        </th>
        <th>
        <div className="d-flex flex-row justify-content-center">
            <button type="button" className="btn btn-light"
            onClick={()=>this.sortResult('TaskName',true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                </svg>
            </button>

            <button type="button" className="btn btn-light"
            onClick={()=>this.sortResult('TaskName',false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
                </svg>
            </button>
        </div>
        <div className="d-flex flex-row justify-content-center">
        <input className="form-control m-2"
            onChange={this.changeTaskNameFilter}
            placeholder="Filter"/>
        </div>
            TaskName
        </th>
        <th>
            TaskDescription
        </th>
        <th>
            Options
        </th>
    </tr>
    </thead>
    <tbody>
        {tasks.map(tsk=>
            <tr key={tsk.TaskId}>
                <td>{tsk.TaskId}</td>
                <td>{tsk.TaskName}</td>
                <td>{tsk.TaskDescription}</td>
                <td>
                <button type="button"
                className="btn btn-light mr-1"
                data-bs-toggle="modal"
                data-bs-target="#exampleModal"
                onClick={()=>this.editClick(tsk)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                    </svg>
                </button>

                <button type="button"
                className="btn btn-light mr-1"
                onClick={()=>this.deleteClick(tsk.TaskId)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
                    </svg>
                </button>

                <button type="button"
                className="btn btn-light mr-1"
                data-bs-toggle="modal"
                data-bs-target="#saveModal"
                onClick={()=>this.addUserTaskClick(tsk)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bookmark-check-fill" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M2 15.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5zm8.854-9.646a.5.5 0 0 0-.708-.708L7.5 7.793 6.354 6.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z"/>
                    </svg>
                </button>

                </td>
            </tr>
            )}
    </tbody>
    </table>

<div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true">
<div className="modal-dialog modal-lg modal-dialog-centered">
<div className="modal-content">
   <div className="modal-header">
       <h5 className="modal-title">{modalTitle}</h5>
       <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"
       ></button>
   </div>

   <div className="modal-body">
       <div className="input-group mb-3">
        <span className="input-group-text">Task Name</span>
        <input type="text" className="form-control"
        value={TaskName}
        onChange={this.changeTaskName}/>
       </div>

       <div className="input-group mb-3">
        <span className="input-group-text">Task Description</span>
        <input type="text" className="form-control"
        value={TaskDescription}
        onChange={this.changeTaskDescription}/>
       </div>

        {TaskId==0?
        <button type="button"
        className="btn btn-primary float-start"
        onClick={()=>this.createClick()}
        >Create</button>
        :null}

        {TaskId!=0?
        <button type="button"
        className="btn btn-primary float-start"
        onClick={()=>this.updateClick()}
        >Update</button>
        :null}

   </div>

</div>
</div> 
</div>

<div className="modal fade" id="saveModal" tabIndex="-1" aria-hidden="true">
<div className="modal-dialog modal-lg modal-dialog-centered">
<div className="modal-content">
   <div className="modal-header">
       <h5 className="modal-title">{modalTitle}</h5>
       <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"
       ></button>
   </div>

   <div className="modal-body">
       <div className="input-group mb-3">
        <span className="input-group-text">Task Name</span>
        <input type="text" className="form-control"
        value={TaskName} readOnly/>
       </div>
       
       <div className="input-group mb-3">
        <span className="input-group-text">Task Description</span>
        <input type="text" className="form-control"
        value={TaskDescription} readOnly/>
       </div>

       <div className="input-group mb-3">
            <span className="input-group-text">Expiration Date</span>
            <input type="date" className="form-control"
            value={ExpirationDate}
            onChange={this.changeExpirationDate}/>
        </div>

        <button type="button"
        className="btn btn-primary float-start"
        onClick={()=>this.saveUserTaskClick()}
        >Add to user's tasks</button>
   </div>

</div>
</div> 
</div>

    <Switch>
        <Route path='/user' component={UserSaves} /> 
    </Switch>
</div>
        )
    }
}