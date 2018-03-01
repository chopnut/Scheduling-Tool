import React, { Component } from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import {calendar_page_move_dep_side_by_side} from '../../actions/CalendarActions';
import {Popup} from 'semantic-ui-react';

// Custom component
import JobSummaryWindow from '../../layouts/calendar/JobSummaryWindow';

class CalendarCell extends Component {
    constructor(props){
        super(props);
        this.state = {
            isLoading: true,
            background_color: '#eee',

            // Job Summary Window Options
            is_window_open: false
        }
        this.actionChangeSideToSide = this.actionChangeSideToSide.bind(this);
        this.hover_in_job_bag      = this.hover_in_job_bag.bind(this);
        this.hover_out_job_bag     = this.hover_out_job_bag.bind(this);

        // Window job summary functions below
        this.handleWindowClose = this.handleWindowClose.bind(this);
        this.handleWindowOpen  = this.handleWindowOpen.bind(this);
    }
    handleWindowClose(){
        this.setState((prevState, props) => (
            {is_window_open: false}
        ));
    }
    handleWindowOpen(){
        this.setState((prevState, props) => (
            {is_window_open: true}
        ));
    }
    hover_in_job_bag(){
        this.setState((prevState, props) => (
            {background_color: this.props.colours_setting.hover_calendar_job}
        ));
        this.handleWindowOpen();
    }
    hover_out_job_bag(){
        if(this.state.is_window_open){
            this.setState((prevState, props) => (
                {background_color: '#eee'}
            ));
            this.handleWindowClose();
        }
    }
    actionChangeSideToSide(jobId,day,toKey){
        let info = {
            jobId,
            day,
            toKey,
            deptId: this.props.jd.dep.job_dp_dept,
            dayKey: this.props.dayKey,
            userId: this.props.userId
        }
        console.log("Move to side: ",info);

        // Call the action creator to update state
        this.props.calendar_page_move_dep_side_by_side(this.props.settings, info);
    }
    shouldComponentUpdate(nextProps,nextState){

        // Let it change state when changing the component date.
        if(nextState != this.state){
            return true;
        }
        // If the same job bag department is still the same do not update
        if(nextProps.jd.dep.job_dp_id == this.props.jd.dep.job_dp_id){
            return false;
        }
        return true;
    }
    componentDidUpdate(prevProps, prevState){
        $(".chevron").popup();
    }
    componentDidMount(){
        this.setState(function(state,props){
            return ({state,isLoading: false});
        });
    }
    render(){

        const jd = this.props.jd.dep;
        const bg = this.props.jd.bag;
        const leftArrowClass  = "chevron left icon";
        const rightArrowClass = "chevron right icon";


        if(this.state.isLoading){
            return(<div>Loading...</div>);
        }else{
            return(
                <div className="cell"
                     style={{backgroundColor: this.state.background_color}}
                     draggable={true}
                     onDragStart={(e)=>{
                         // pass the job department to the handler from row
                         this.props.initDrag(e,this.props.jd,this.props.dayKey);
                     }}
                     onDragEnd    = {(e)=>{ this.props.initDragEnd(e) }}
                     onMouseEnter = {()=>{  this.hover_in_job_bag() }}
                     onMouseLeave = {()=>{  this.hover_out_job_bag()}}
                >
                    <div className="contain">
                        <div className="cell_head">
                            <table width="100%" cellPadding={0} cellSpacing={0}>
                                <tbody>
                                    <tr>
                                        <td className="cell_left">
                                            <i className={leftArrowClass} data-content="Move previous day" data-variation="tiny" onClick={()=>{
                                                this.actionChangeSideToSide(jd.job_dp_id, this.props.prevDate, this.props.prevDayKey );
                                                }
                                            }></i>
                                        </td>
                                        <td className="cell_middle">{bg.job_prism_number}</td>
                                        <td className="cell_right">
                                            <i className={rightArrowClass} data-content="Move next day" data-variation="tiny" onClick={()=>{
                                                this.actionChangeSideToSide(jd.job_dp_id, this.props.nextDate, this.props.nextDayKey);
                                                }
                                            }></i>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="cell_title">
                            <Popup trigger={<i>{bg.job_title}</i>}
                                   className="window_job_summary"
                                   position="right center"
                                   flowing
                                   offset={35}
                                   basic={true}
                                   hoverable = {true}
                                   id={" "}
                                   onClose  ={this.handleWindowClose}
                                   onOpen   ={this.handleWindowOpen}
                                   open     ={this.state.is_window_open}>
                                    <JobSummaryWindow/>
                            </Popup>

                        </div>
                    </div>
                </div>
            );
        }
    }
}
function mapStateToProps(state,ownprops) {
    return({
        settings: state.settings,
        colours_setting: JSON.parse(state.settings.setting.colours_setting)
    });
}
function mapDispatchToProps(dispatch){
    return({
        calendar_page_move_dep_side_by_side: (settings,info)=>{
            dispatch(calendar_page_move_dep_side_by_side(settings,info));
        }
    });
}
export default connect(mapStateToProps,mapDispatchToProps)(CalendarCell);
