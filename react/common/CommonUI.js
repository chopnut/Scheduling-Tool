import React, { Component } from 'react';
import { Dropdown, Header } from 'semantic-ui-react'

export function showJobType(jobType,onChangeFunc,includeLabel=false){
    let once        = <input type="radio" name="job_type" tabIndex="0" value="once" onChange={onChangeFunc} checked/>;
    let recurring   = <input type="radio" name="job_type" tabIndex="0" value="recurring" onChange={onChangeFunc} checked/>;
    if(jobType=="once"){
        recurring   = <input type="radio" name="job_type" tabIndex="0" value="recurring" onChange={onChangeFunc} checked={false}/>;
    }else{
        once        = <input type="radio" name="job_type" tabIndex="0" value="once" onChange={onChangeFunc} checked={false}/>;
    }
    return(
        <div className="inline fields job_type">
            <div className="field">
                {includeLabel?<label> Job Type: &nbsp; &nbsp;</label>:""}
                <span className="ui radio checkbox">
                    {once}
                    <label> Once &nbsp;</label>
                </span>
                <span className="ui radio checkbox">
                    {recurring}
                    <label> Recurring </label>
                </span>
            </div>
        </div>
    );
}

export function showDropDown(options,
                             selections,
                             onchangeFunction,
                             placeholder,
                             id,
                             multiple,
                             search){
                                 
    const multiple_prop = (typeof(multiple)=='undefined'); // if multiple is set MULTIPLE IS FALSE
    const search_prop   = !(typeof(search)=='undefined');   // if search   is set SEARCH IS TRUE


    return(
        <Dropdown placeholder={placeholder}
                  fluid
                  floating
                  multiple  = {multiple_prop}
                  search    = {search_prop}
                  selection
                  id        = {id}
                  name      = {id}
                  options   = {options}
                  value     = {selections}
                  onChange  = {onchangeFunction}
        />
    );
}
export function displayWorkingLoading(that){
    return <div style={{float: "left",width:"100px",height:"40px",position: "absolute"}}>
        <div className="ui active tiny inline loader" style={{
            marginLeft: '10px',
            marginTop: '7px',
            display: (that.props.calendar_page.isWorking) ? "inline-block" : "none",
            float: "left"
        }}></div>
    </div>
}
export function getLoader(size=""){
    return <div className={"ui active "+size+" inline loader"}></div>;
}


