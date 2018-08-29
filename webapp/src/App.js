import React from 'react';
import './App.css';
import {global_theme_color} from './constants';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {AppBar, IconButton, IconMenu, MenuItem} from "material-ui";
import {NavigationApps} from "material-ui/svg-icons/index";
import DistributionExplorer from './DistributionExplorer';
import DocumentSpace from "./DocumentSpace";

import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'
import Points from "./Points";
// import Trends from "./Trends";

const customBaseTheme = {
    slider: {
        selectionColor: global_theme_color,
        handleFillColor: global_theme_color
    },
    textField: {
        focusColor: global_theme_color
    },
    appBar: {
        color: "#222"
    }
};

const App = () => {
    return (
        <Router>
            <MuiThemeProvider muiTheme={getMuiTheme(customBaseTheme)}>
                <div className="App">
                    <AppBar
                        iconElementLeft={
                            <IconMenu
                                iconButtonElement={
                                    <IconButton ><NavigationApps color={'white'}/></IconButton>
                                }
                                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                anchorOrigin={{horizontal: 'right', vertical: 'top'}}

                            >
                                <MenuItem primaryText="Distribution Explorer"
                                          containerElement={<Link to="/distribution_explorer"/>}
                                />
                                {/*<MenuItem primaryText="Trends"*/}
                                          {/*containerElement={<Link to="/trends"/>}*/}
                                {/*/>*/}

                                <MenuItem primaryText="Document Space"
                                          containerElement={<Link to="/document_space"/>}
                                />
                            </IconMenu>}
                        title="TextLab"
                    />

                    <div className="App-intro">
                        <Route exact path="/" component={DistributionExplorer}/>
                        <Route path="/distribution_explorer" component={DistributionExplorer}/>
                        {/*<Route path="/trends" component={Trends}/>*/}
                        <Route path="/document_space" component={DocumentSpace}/>

                    </div>
                    <span>Copyright © Patrick Mesana</span>
                </div>
            </MuiThemeProvider>
        </Router>
    );
};


export default App;
