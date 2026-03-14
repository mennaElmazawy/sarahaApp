

export const create = async ({ model, data } = {}) => {
    return await model.create(data);
}


export const findOne = async ({ model, filter = {}, options = {},select="" } = {}) => {
    const doc = model.findOne(filter).select(select);
    if (options.populate) {
        doc.populate(options.populate)
    }
    if (options.skip) {
        doc.skip(options.skip)
    }
    if (options.limit) {
        doc.limit(options.limit)
    }

    return await doc.exec();
}
export const find = async ({ model, filter = {}, options = {} } = {}) => {
    const doc = model.find(filter);
    if (options.populate) {
        doc.populate(options.populate)
    }
    if (options.skip) {
        doc.skip(options.skip)
    }
    if (options.limit) {
        doc.limit(options.limit)
    }

    return await doc.exec();
}


export const findById = async ({model,id, populate=[],select=""}={})=>{
    return await model.findById(id).populate(populate).select(select)
}
export const updateOne = async ({ model, filter = {}, update = {}, options = {} } = {}) => {

    const doc = model.updateOne(filter, update, { runValidators: true, ...options });
    return await doc.exec();
}


export const findOneAndUpdate = async ({ model, filter = {}, update = {}, options = {} } = {}) => {

    const doc = model.findOneAndUpdate(filter, update, { new: true, runValidators: true, ...options });
    return await doc.exec();
}

export const deleteOne = async ({ model, filter = {} } = {}) => {
    return await model.deleteOne(filter);
}

export const deleteMany = async ({ model, filter = {} } = {}) => {
    return await model.deleteMany(filter);
}