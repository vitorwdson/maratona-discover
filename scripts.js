const Modal = {
    modal: document.querySelector('.modal-overlay'),

    open() {
        this.modal.classList.add('active')
    },
    
    close() {
        this.modal.classList.remove('active')
    }
}

const Transaction = {
    all: [],

    getAll() {
        return this.all
    },

    setAll(transactions) {
        this.all = transactions
    },

    add(transaction) {
        this.all.push(transaction)
        App.reload()
    },

    remove(index) {
        this.all.splice(index, 1)
        App.reload()
    }
}

const Balance = {
    evaluateIncome() {
        let income = 0

        for (const { amount } of Transaction.all) {
            if (amount > 0)
                income += amount
        }

        return income
    },

    evaluateExpense() {
        let expense = 0

        for (const { amount } of Transaction.all) {
            if (amount < 0)
                expense += amount
        }

        return expense
    },

    evaluateTotal() {
        return (this.evaluateIncome() + this.evaluateExpense())
    },

    updateBalance() {
        const incomeElement = document.querySelector('.card.income p')
        const expenseElement = document.querySelector('.card.expense p')
        const totalElement = document.querySelector('.card.total p')

        incomeElement.innerText = Utils.formatCurrency(this.evaluateIncome())
        expenseElement.innerText = Utils.formatCurrency(this.evaluateExpense()).replace('- ', '')
        totalElement.innerText = Utils.formatCurrency(this.evaluateTotal())
    }
}

const Utils = {
    formatCurrency(amount) {
        amount = Number(amount)

        const sign = amount < 0 ? '- ' : ''
        const absAmount = Math.abs(amount) / 100
        const currency = absAmount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        })

        return `${sign}${currency}`
    },

    formatAmount(amount) {
        const value = Number(amount) * 100

        return value
    },

    formatDate(date) {
        date = date.split('-')
        return `${date[2]}/${date[1]}/${date[0]}`
    }
}

const Table = {
    buildRow(transaction, index) {
        const table = document.querySelector('#data-table tbody')
        const { description, amount, date } = transaction
        const amountClass = amount > 0 ? 'income' : 'expense'

        const row = document.createElement('tr')
        row.innerHTML = `
            <td class="description">${description}</td>
            <td class="${amountClass}">${Utils.formatCurrency(amount)}</td>
            <td>${date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `

        table.appendChild(row)
    },

    updateTable() {
        const table = document.querySelector('#data-table tbody')
        table.innerHTML = ''
        Transaction.all.forEach(this.buildRow)
    }
}

const Form = {
    validateData(form) {
        let { description, amount, date } = form

        description = description.value.trim(' ')
        amount = amount.value.trim(' ')
        date = date.value.trim(' ')

        if (description === '' || amount === '' || date === '')
            throw new Error('Preencha os dados corretamente.')

        return { description, amount, date }
    },

    formatData(data) {
        let { description, amount, date } = data

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return { description, amount, date }
    },

    clearForm(form) {
        let { description, amount, date } = form

        description.value = ''
        amount.value = ''
        date.value = ''
    },

    submit(event) {
        event.preventDefault()
        const form = document.querySelector('#form form')

        try {
            const validatedData = this.validateData(form)
            const formattedData = this.formatData(validatedData)

            Transaction.add(formattedData)
            this.clearForm(form)
            Modal.close()
        } catch (error) {
            alert(error.message)
            console.log(error)
        }
        
    }
}

const Storage = {
    getTransactions() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions') || '[]')
    },

    setTransactions(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
    }
}

const App = {
    init() {
        Transaction.setAll(Storage.getTransactions())
        this.reload()
    },

    reload() {
        Table.updateTable()
        Balance.updateBalance()

        Storage.setTransactions(Transaction.getAll())
    }
}

App.init()