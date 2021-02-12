let CompanyModel = (companyName, companyEmail, companyPassword, company_opens_at, 
    company_closes_at,
    companyCharge,
    companySlots,
    companyLongitude,
    companyLatitude
    ) => {
    return {
        name: companyName,
        email: companyEmail,
        opens_at: company_opens_at,
        closes_at: company_closes_at,
        password: companyPassword,
        charge: companyCharge,
        slots: companySlots,
        active_slots: companySlots,
        latitude: companyLatitude,
        longitude: companyLongitude

    }
}
let TicketModel = (user_plate_number, user_start_time, user_company, user_price = 0, user_end_time = ""
    ) => {
    return {
        plate_number: user_plate_number,
        company: user_company,
        start_time: user_start_time,
        end_time: user_end_time,
        price: user_price

    }
}
let UserModel = (userName, userEmail, userPlateNumber = "", userRole, userPassword, userPhone, userCompany = "") => {
    return {
        name: userName,
        email: userEmail,
        role: userRole,
        password: userPassword,
        phone_no: userPhone,
        plate_number: userPlateNumber,
        company: userCompany
    }
}
