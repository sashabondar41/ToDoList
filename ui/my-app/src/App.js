import './App.css';
import './styles.scss'
import {Home} from './Home';
import {UserSaves} from './UserSaves';
import {BrowserRouter, Route, Switch, NavLink} from 'react-router-dom';
import { Tasks } from './Tasks';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/' exact={true} component={Home} /> 
        <Route path='/tasks' component={Tasks}/>
        <Route path='/user' component={UserSaves}/>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
