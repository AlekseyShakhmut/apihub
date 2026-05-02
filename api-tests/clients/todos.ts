import {generateNewToDo} from "../utils/data_generator"
import {ToDo} from "../utils/types"
import {APIRequestContext} from "@playwright/test";

export class ToDoListPoints {
    constructor(private request: APIRequestContext) {}

    async createToDo(data?: Partial<ToDo>){
        const toDoList = data || generateNewToDo();
        return await this.request.post('todos/',{
            data: toDoList,
        })
    }
}