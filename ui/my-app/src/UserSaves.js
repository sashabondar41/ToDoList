import React,{Component} from 'react';
import {variables} from './Variables.js';
import { Home } from './Home.js';
import {Route, Switch, NavLink} from 'react-router-dom';
import { Tasks } from './Tasks.js';
import MD5 from "crypto-js/md5";
import Swal from 'sweetalert2'


export class UserSaves extends Component{

    constructor(props){
        super(props);

        this.state={
            tasks:[],
            modalTitle:"",
            UserId:this.props.location.state,
            FirstName:"",
            LastName:"",
            Login:"",
            Password:"",
            NewPassword:"",
            RepeatedPassword:"",
            Photo:"anonymous.png",
            PhotoPath:variables.PHOTO_URL,
            TaskId:"",
            TaskName:"",
            TaskDescription:"",
            ExpirationDate:"",
            Finished:"",
            ProbablePassword:"",
            saves:[],

            TaskIdFilter:"",
            TaskNameFilter:"",
            ExpirationDateFilter:"",
            tasksWithoutFilter:[]
        }
    }

    FilterFn(){
        var TaskIdFilter=this.state.TaskIdFilter;
        var TaskNameFilter = this.state.TaskNameFilter;
        var ExpirationDateFilter = this.state.ExpirationDateFilter;
        var filteredData=this.state.tasksWithoutFilter.filter(
            function(el){
                return el.TaskId.toString().toLowerCase().includes(
                    TaskIdFilter.toString().trim().toLowerCase()
                )&&
                el.TaskName.toString().toLowerCase().includes(
                    TaskNameFilter.toString().trim().toLowerCase()
                )&&
                el.ExpirationDate.toString().toLowerCase().includes(
                    ExpirationDateFilter.toString().trim().toLowerCase()
                )
            }
        );

        this.setState({tasks:filteredData});

    }

    sortResult(prop,asc){
        if (prop = "ExpirationDate"){
            var sortedData=this.state.tasksWithoutFilter.sort(function(a,b){
                if(asc){
                    return (Date.parse(a[prop])>Date.parse(b[prop]))?1:((Date.parse(a[prop])<Date.parse(b[prop]))?-1:0);
                }
                else{
                    return (Date.parse(b[prop])>Date.parse(a[prop]))?1:((Date.parse(b[prop])<Date.parse(a[prop]))?-1:0);
                }
            });
        }else{
            var sortedData=this.state.tasksWithoutFilter.sort(function(a,b){
                if(asc){
                    return (a[prop]>b[prop])?1:((a[prop]<b[prop])?-1:0);
                }
                else{
                    return (b[prop]>a[prop])?1:((b[prop]<a[prop])?-1:0);
                }
            });
        }
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
    changeExpirationDateFilter = (e)=>{
        this.state.ExpirationDateFilter=e.target.value;
        this.FilterFn();
    }

    getUserData(){
        fetch(variables.API_URL+'user/'+this.state.UserId)
        .then(response=>response.json())
        .then(data=>{
            this.setState({
                Login:data[0]["Login"],
                LastName:data[0]["LastName"],
                FirstName:data[0]["FirstName"],
                Photo:data[0]["Photo"],
                Password:data[0]["Password"]
            });
        });
    }

    refreshList(){
        fetch(variables.API_URL+'usertask/'+this.state.UserId)
        .then(response=>response.json())
        .then(data=>{
            var arr = [];
            data.forEach(element => {
                arr.push(element["TaskId"]);
            });
            this.setState({tasks:data, tasksWithoutFilter:data, saves:arr});
        });
    }

    componentDidMount(){
        this.refreshList();
        this.getUserData();
    }
    
    changeLastName =(e)=>{
        this.setState({LastName:e.target.value});
    }
    changeFirstName =(e)=>{
        this.setState({FirstName:e.target.value});
    }
    changeLogin =(e)=>{
        this.setState({NewLogin:e.target.value});
    }
    changePassword =(e)=>{
        this.setState({ProbablePassword:e.target.value});
    }
    changeNewPassword =(e)=>{
        this.setState({NewPassword:e.target.value});
    }
    changeRepeatedPassword =(e)=>{
        this.setState({RepeatedPassword:e.target.value});
    }
    changeFinished(){
        if (this.state.Finished){
            this.setState({Finished:false});
        }else{
            this.setState({Finished:true});
        }
    }
    changeExpirationDate =(e)=>{
        this.setState({ExpirationDate:e.target.value});
    }

    editTaskClick(utsk){
        this.setState({
            modalTitle:"Edit Task",
            TaskId:utsk.TaskId,
            TaskName:utsk.TaskName,
            TaskDescription:utsk.TaskDescription,
            ExpirationDate:utsk.ExpirationDate,
            Finished:utsk.Finished
        });
    }

    loginSwap(){
        this.setState({NewLogin:this.state.Login, modalTitle:"Edit profile"});
    }

    preparePass(){
        this.setState({modalTitle:"Change password"})
    }

    changePasswordClick(){
        if (this.state.Password != MD5(this.state.ProbablePassword).toString()){
            Swal.fire(
                'Ooops...',
                'Current password is wrong',
                'error'
            );
        }else if (this.state.NewPassword != this.state.RepeatedPassword){
            Swal.fire(
                'Ooops...',
                'Passwords are not equal',
                'error'
            );
        }else if (this.state.NewPassword.length < 8){
            Swal.fire(
                'Ooops...',
                'New password is too short',
                'error'
            );
        }else{
            this.setState({Password:MD5(this.state.NewPassword).toString(), ProbablePassword:"", NewPassword:"", RepeatedPassword:""})
            fetch(variables.API_URL+'user/changepassword',{
                method:'PUT',
                headers:{
                    'Accept':'application/json',
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    UserId:this.state.UserId,
                    Password:MD5(this.state.NewPassword).toString()
                })
            })
            .then(res=>res.json())
            .then((result)=>{
                Swal.fire(
                    'Success!',
                    'Passwords has been changed!',
                    'success'
                );
                this.refreshList();
            },(error)=>{
                Swal.fire(
                    'Ooops...',
                    'SOmething went wrong',
                    'error'
                );
            })
        }
    }

    updateClick(){
        if (this.state.NewLogin.length < 6){
            Swal.fire(
                'Ooops...',
                'Login is too short',
                'error'
            );
        }else{
            fetch(variables.API_URL+'user/login')
            .then(response=>response.json())
            .then(data=>{
                var logins = [];
                data.forEach(element => {
                logins.push(element["Login"])
                });
                if (logins.includes(this.state.NewLogin) && this.state.NewLogin!=this.state.Login){
                    Swal.fire(
                        'Ooops...',
                        'Login is already taken',
                        'error'
                    );
                }else{
                    this.setState({Login:this.state.NewLogin})
                    fetch(variables.API_URL+'user',{
                        method:'PUT',
                        headers:{
                            'Accept':'application/json',
                            'Content-Type':'application/json'
                        },
                        body:JSON.stringify({
                            UserId:this.state.UserId,
                            LastName:this.state.LastName,
                            FirstName:this.state.FirstName,
                            Photo:this.state.Photo,
                            Login:this.state.NewLogin,
                        })
                    })
                    .then(res=>res.json())
                    .then((result)=>{
                        Swal.fire(
                            'Yes!',
                            'Profile has been edited',
                            'success'
                        );
                        this.refreshList();
                    },(error)=>{
                        Swal.fire(
                            'Ooops...',
                            'SOmething went wrong',
                            'error'
                        );
                    })
                }
            });
        }
    }

    updateUserTaskClick(){
        fetch(variables.API_URL+'usertask',{
            method:'PUT',
            headers:{
                'Accept':'application/json',
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                TaskId:this.state.TaskId,
                UserId:this.state.UserId,
                ExpirationDate:this.state.ExpirationDate,
                Finished:this.state.Finished,
            })
        })
        .then(res=>res.json())
        .then((result)=>{
            Swal.fire(
                'Yes!',
                'Task has been edited',
                'success'
            );
            this.refreshList();
        },(error)=>{
            Swal.fire(
                'Ooops...',
                'Something went wrong',
                'error'
            );
        })
    }

    

    deleteTaskClick(id){
        Swal.fire({
            title: 'Are you sure?',
            showDenyButton: true,
            confirmButtonText: 'Yes!',
            denyButtonText: `No!`,
            icon:'question'
          }).then((result) => {
            if (result.isConfirmed) {
                fetch(variables.API_URL+'usertask',{
                    method:'DELETE',
                    headers:{
                        'Accept':'application/json',
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({
                        TaskId:id,
                        UserId:this.state.UserId,
                    })
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
                        'Ooops...',
                        'Something went wrong',
                        'error'
                    );
                })
            } else if (result.isDenied) {
              Swal.fire('Action Denied', 'It\'s always your choice', 'info')
            }
          })
    }

    imageUpload=(e)=>{
        e.preventDefault();

        const formData=new FormData();
        formData.append("file",e.target.files[0],e.target.files[0].name);

        fetch(variables.API_URL+'user/savefile',{
            method:'POST',
            body:formData
        })
        .then(res=>res.json())
        .then(data=>{
            this.setState({Photo:data});
        })
    }

    render(){
        const {
            tasks,
            modalTitle,
            FirstName,
            LastName,
            Photo,
            PhotoPath,
            TaskName,
            TaskDescription,
            ExpirationDate,
            Finished,
            NewLogin
        }=this.state;
        return(
<div className="App container">
    <NavLink
    className="btn btn-primary m-2 float-start" to="/">
        Log Out
    </NavLink>
    <NavLink
    className="btn btn-primary m-2 float-start" to={{
        pathname:"/tasks",
        state: {"UserId":this.state.UserId,
                "saves":this.state.saves}
    }}>
        To all tasks
    </NavLink>
    <button type="button"
    className="btn btn-primary m-2 float-end"
    data-bs-toggle="modal"
    data-bs-target="#passwordModal"
    onClick={()=>this.preparePass()}>
        Change Password
    </button>
    <button type="button"
    className="btn btn-primary m-2 float-end"
    data-bs-toggle="modal"
    data-bs-target="#exampleModal"
    onClick={()=>this.loginSwap()}>
        Edit Profile
    </button>
    <table className="table table-hover">
    <thead className="thead-dark">
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
        <div className="d-flex flex-row justify-content-center">
        <button type="button" className="btn btn-light"
            onClick={()=>this.sortResult('ExpirationDate',true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                </svg>
            </button>

            <button type="button" className="btn btn-light"
            onClick={()=>this.sortResult('ExpirationDate',false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
                </svg>
            </button>
        </div>
        <div className="d-flex flex-row justify-content-center">
            <input className="form-control m-2"
            onChange={this.changeExpirationDateFilter}
            placeholder="Filter"/>
        </div>
            ExpirationDate
        </th>
        <th>
            Finished
        </th>
        <th>
            Options
        </th>
    </tr>
    </thead>
    <tbody>
        {tasks.map(utsk=>
            <tr key={utsk.TaskId}>
                <td>{utsk.TaskId}</td>
                <td>{utsk.TaskName}</td>
                <td>{utsk.TaskDescription}</td>
                <td>{utsk.ExpirationDate}</td>
                <td>{utsk.Finished?"Yes":"No"}</td>
                <td>
                <button type="button"
                className="btn btn-light mr-1"
                data-bs-toggle="modal"
                data-bs-target="#taskModal"
                onClick={()=>this.editTaskClick(utsk)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                    </svg>
                </button>

                <button type="button"
                className="btn btn-light mr-1"
                onClick={()=>this.deleteTaskClick(utsk.TaskId)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bookmark-x-fill" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M2 15.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5zM6.854 5.146a.5.5 0 1 0-.708.708L7.293 7 6.146 8.146a.5.5 0 1 0 .708.708L8 7.707l1.146 1.147a.5.5 0 1 0 .708-.708L8.707 7l1.147-1.146a.5.5 0 0 0-.708-.708L8 6.293 6.854 5.146z"/>
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
    <div className="d-flex flex-row bd-highlight mb-3">
     
     <div className="p-2 w-50 bd-highlight">
    
        <div className="input-group mb-3">
            <span className="input-group-text">Last Name</span>
            <input type="text" className="form-control"
            value={LastName}
            onChange={this.changeLastName}/>
        </div>

        <div className="input-group mb-3">
            <span className="input-group-text">First Name</span>
            <input type="text" className="form-control"
            value={FirstName}
            onChange={this.changeFirstName}/>
        </div>

        <div className="input-group mb-3">
            <span className="input-group-text">Login</span>
            <input type="text" className="form-control"
            value={NewLogin}
            onChange={this.changeLogin}/>
        </div>

    </div>
    <div className="p-2 w-50 bd-highlight">
         <img width="250px" height="250px"
         src={PhotoPath+Photo}/>
         <input className="m-2" type="file" onChange={this.imageUpload}/>
    </div>
    </div>

    <button type="button"
        className="btn btn-primary float-start"
        onClick={()=>this.updateClick()}>
            Update
        </button>
   </div>

</div>
</div> 
</div>

<div className="modal fade" id="taskModal" tabIndex="-1" aria-hidden="true">
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

        <div className="input-group mb-3">
        {Finished?
        <button type="button"
        className="btn btn-success"
        onClick={()=>this.changeFinished()}>
            Finished
        </button>
        :<button type="button"
        className="btn btn-danger"
        onClick={()=>this.changeFinished()}>
            Not Finished
        </button>}
        </div>

        <button type="button"
        className="btn btn-primary float-start"
        onClick={()=>this.updateUserTaskClick()}>
            Change
        </button>
        
   </div>
</div>
</div>
</div>

<div className="modal fade" id="passwordModal" tabIndex="-1" aria-hidden="true">
<div className="modal-dialog modal-lg modal-dialog-centered">
<div className="modal-content">
   <div className="modal-header">
       <h5 className="modal-title">{modalTitle}</h5>
       <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"
       ></button>
   </div>

   <div className="modal-body">
        <div className="input-group mb-3">
            <span className="input-group-text">Current password</span>
            <input type="password" className="form-control"
            onChange={this.changePassword}/>
        </div>

        <div className="input-group mb-3">
            <span className="input-group-text">New password</span>
            <input type="password" className="form-control"
            onChange={this.changeNewPassword}/>
        </div>

        <div className="input-group mb-3">
            <span className="input-group-text">Repeat new password</span>
            <input type="password" className="form-control"
            onChange={this.changeRepeatedPassword}/>
        </div>
        <div className="input-group mb-3">
            <button type="button"
            className="btn btn-primary float-start"
            onClick={()=>this.changePasswordClick()}>
                Change
            </button>
        </div>
    </div>

</div>
</div> 
</div>
<Switch> 
    <Route path='/' exact component={Home}/>
    <Route path='/tasks' exact component={Tasks}/>
</Switch>
</div>
        )
    }
}