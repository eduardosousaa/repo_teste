import {format} from "date-fns";

export default function FormatarData(data, pattern){
    if(!data) return ""
    try{
        return format(new Date(new Date(data).toISOString().slice(0, -1)), pattern)
    }catch(e){
        try{
            return format(data, pattern)
        }catch(e){
            return data
        } 
    }
}