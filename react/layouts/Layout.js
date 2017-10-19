import React, { Component } from 'react';
import {connect} from 'react-redux';
import { NavLink ,IndexLink,Link} from 'react-router-dom';

// THE LAYOUT COMPONENT WILL BE THE ONE POLLING THE DATABASE FOR ANY CHANGES COMING FROM THE DATABASE

class Layout extends Component {

    // Do some initiliazing in the constructor
    constructor(props){
        super(props);


        const settings  = props.store.settings;
        const userlog   = settings.user_detail;
        this.state = {settings, userlog};
        // console.log("From layout: ",settings);

    }

    // Function that will POLL the database for any changes
    startPoll(){

    }
    // Render the Pages Links Tabs
    renderTabs(){
        let tabs = JSON.parse(this.state.settings.tabs);
        return (
          <div className="menu">{tabs.map( function (item , i)
              {
                // Make the first one link to /
                let defaultLinkto       = '/';
                let icon                = item.icon;
                let endClass            = "";

                if(tabs.length == i+1){
                    endClass = "end";
                }
                if(i>0){
                    // This is for the rest of the links
                    defaultLinkto = '/'+item.id;
                    return (<NavLink to={defaultLinkto} activeClassName="RouterLinkSelected" className={"RouterLink "+endClass}><i className={icon}></i> {item.label}</NavLink>);
                }else{
                    // This is for the base /home
                    return (<NavLink exact to={defaultLinkto} activeClassName="RouterLinkSelected" className="RouterLink"><i className={icon}></i> {item.label} </NavLink> );
                }
              }
          )}
          </div>
        );
    }
    render() {
        return (
                <div className="content_holder">
                    {this.renderTabs()}

                   <div className="page_holder">
                       {this.props.children}
                    </div>
                </div>

        );
    }
}
function mapStateToProps(state,ownprops) {
    return{
        store: state
    }
}
// make sure you use {pure:false} is included when using router or use withRouter(connect(mapStateToProps));
export default connect(mapStateToProps,null,null,{pure:false})(Layout);

