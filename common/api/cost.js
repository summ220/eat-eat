import request from './api.js'

export default {
    /**
     * 保存家庭消费记录
     * @param {string} familyCode 家庭码/ID
     * @param {string} consumptionRecordJson 消费记录JSON
     * name、price、categoryId、date
     */
    saveFamilyConsumptionRecord(familyCode, consumptionRecordJson) {
        return request('/saveFamilyConsumptionRecord', 'POST', {
            familyCode,
            consumptionRecordJson
        })
    },

    /**
     * 获取家庭消费记录
     * @param {string} familyCode 家庭码/ID
     * @param {object} params 参数
     * categoryId、startTime、endTime
     */
    getFamilyConsumptionRecords(familyCode, params) {
        return request('/getFamilyConsumptionRecords', 'GET', {
            familyCode,
            ...params
        })
    },

    /**
     * 更新家庭消费记录
     * @param {string} familyCode 家庭码/ID
     * @param {string} consumptionRecordJson 消费记录JSON
     * id、name、price、categoryId、date
     */
    updateFamilyConsumptionRecord(familyCode, consumptionRecordJson) {
        return request('/updateFamilyConsumptionRecord', 'POST', {
            familyCode,
            consumptionRecordJson
        })
    },

    /**
     * 删除家庭消费记录
     * @param {string} familyCode 家庭码/ID
     * @param {string} id 消费记录ID
     */
    deleteFamilyConsumptionRecord(familyCode, id) {
        return request('/deleteFamilyConsumptionRecord', 'POST', {
            familyCode,
            id
        })
    }
}