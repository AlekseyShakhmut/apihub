import {test, expect} from "../../fixtures/auth_context"

test.describe('Crud операции со списком дел', () => {

    test('Create, Read, Update, Delete', async ({request, toDoClient, authToken}) =>{
        const headers = {Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json'}
        const responsePost = await toDoClient.createToDo()
        expect(responsePost.status()).toBe(201)
        const bodyPost = await responsePost.json();

        expect(bodyPost.data.isComplete).toBe(false)
        const todoId = bodyPost.data._id
        const taskTitle = bodyPost.data.title
        const taskDescription = bodyPost.data.description

        //проверим корректность данных через get запрос

        const responseGet = await request.get(`todos/${todoId}`,{
            headers
        })
          expect (responseGet.status()).toBe(200)
            const bodyGet = await responseGet.json();
            expect(bodyGet.data).toMatchObject({
                title: taskTitle,
                description: taskDescription,
                isComplete: false
            })

        //обновим данные через patch запрос

        const responsePatch = await request.patch(`todos/${todoId}`,{
            data: {
                title: 'Just checking change title',
                description: 'all many information'
            },
            headers
        })
        expect(responsePatch.status()).toBe(200)
        const bodyPatch = await responsePatch.json()
        const titleNew = bodyPatch.data.title
        const descriptionNew = bodyPatch.data.description

        const responseGet2 = await request.get(`todos/${todoId}`,{
            headers
        })
        expect (responseGet2.status()).toBe(200)
        const responseGet3 = await responseGet2.json()

        expect(responseGet3.data.title).toBe(titleNew)
        expect(responseGet3.data.title).not.toBe(taskTitle)

        expect(responseGet3.data.description).toBe(descriptionNew)
        expect(responseGet3.data.description).not.toBe(taskDescription)

        //сделаем запрос на изменение статус

        const changeStatus = await request.patch(`todos/toggle/status/${todoId}`,{
            headers
        })
        expect(changeStatus.status()).toBe(200)
        const bodyChange = await changeStatus.json()
        expect (bodyChange.data.isComplete).toBe(true)

        //проверка обновленного статуса
        const responseGet4 = await request.get(`todos/${todoId}`,{
            headers
        })
        expect (responseGet4.status()).toBe(200)
        const responseGet5 = await responseGet4.json()
        expect (responseGet5.data.isComplete).toBe(true)

        //удаление

        const responseDelete1 = await request.delete(`todos/${todoId}`,{
            headers
        })
        expect(responseDelete1.status()).toBe(200)

        const responseDelete2 = await request.delete(`todos/${todoId}`,{
            headers
        })
        expect(responseDelete2.status()).toBe(404)
        const bodyDelete = await responseDelete2.json()

        expect(bodyDelete.message).toBe('Todo does not exist')
    })
})