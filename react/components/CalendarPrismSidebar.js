import React, { Component } from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import u from '../common/edlibrary';
import PopUpControl from '../components/CalendarPrismBagPopControl';

class CalendarPrismSidebar extends Component {
    constructor(props){
        super(props);
        this.state = {
           isLoading: true,
            jobsFound: [],
            prismBagsPopID: []
        }

    }
    componentDidMount(){
        // Grab prism job bags
        const from = this.props.days[0].date;
        const to   = this.props.days[6].date;
        // to be changed from and to api
        const req  =this.props.settings.react_api_folder+"calendar_prism_jobs_week.php?from="+"01/10/2017"+"&to="+"07/10/2017";

        // Acquire from Prism get API
        const prismbagPromise = axios.get(req);
        prismbagPromise.then(function(res){
            const data = res.data;
            this.setState(function(state,props){
                return ({state,isLoading: false,jobsFound: data});
            });
            // console.log("from prism aside ",data);

        }.bind(this))

        // Trigger pop up if finished loading
        if(!this.state.isLoading){
            console.log("setting up pop up",this.state.prismBagsPopID);

        }

    }

    renderJobs(){
        let cells       = []


        for(let d of this.props.days){

            const day   = d.day.toLowerCase();
            const date  = d.date;
            const jobs  = this.state.jobsFound[day];

            if(jobs!= undefined){
                cells.push(
                    <div className="aside_label">
                        <span className="day"> {u.ucfirst(day)} </span>
                        <span className="date"> {date} </span>
                    </div>
                );
                for(let job of jobs){
                    // For storing the cell info itself

                    const cell = ()=>{
                        return (<div>
                                    <PopUpControl job={job}/>
                                </div>
                        );
                    }


                    cells.push(cell());
                }
            }


        }
        // Get the trigger ids
        return cells;
    }
    render(){

        if(this.state.isLoading){
            return(<div style={{display: 'table', margin: '0 auto'}}>Fetching data...</div>);
        }else{

            return(
            <div>
                {
                   this.renderJobs()
                }
            </div>);
        }
    }
}
function mapStateToProps(state,ownprops) {
    return{
        settings: state.settings
    }
}
function mapDispatchToProps(dispatch){
    return({

    })
}
export default connect(mapStateToProps,mapDispatchToProps)(CalendarPrismSidebar);