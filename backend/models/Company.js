// tour-in/backend/models/Company.js (Usando Mongoose/MongoDB)

const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Por favor, use um email válido']
    },
    password: {
        type: String,
        required: true
    },
    cnpj: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$|^\d{14}$/, 'CNPJ inválido']
    },
    category: {
        type: String,
        enum: ['restaurant', 'event_producer', 'tour_operator', 'hotel', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        maxlength: 500
    },
    // Informações de Localização
    location: {
        type: {
            type: String,
            enum: ['Point'], // Tipo de GeoJSON para indexação espacial
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    date_registered: {
        type: Date,
        default: Date.now
    }
});

// Middleware para criptografar a senha antes de salvar
CompanySchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('Company', CompanySchema);