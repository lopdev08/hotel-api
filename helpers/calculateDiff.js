const calculateDiff = (check_in_date, check_out_date) => {
    const checkInDateReservation = new Date(check_in_date).getTime()
    const checkOutDateReservation = new Date(check_out_date).getTime()
    const diff = (checkOutDateReservation - checkInDateReservation) / (1000 * 60 * 60 * 24)

    return diff
}

module.exports = calculateDiff