const MOCK_DATA = {
    users: {
        librarian: {
            id: 'lib001',
            name: '张馆员',
            role: 'librarian',
            permissions: ['view', 'edit', 'create_area', 'export', 'manage_reminders']
        },
        reader: {
            id: 'rd001',
            name: '李读者',
            role: 'reader',
            permissions: ['view']
        }
    },

    areas: [
        { id: 'A101', name: '综合阅览区A', floor: 1, type: 'reading', x: 50, y: 50, width: 200, height: 150, currentDecibel: 42, status: 'normal', lastUpdated: '2026-06-07 09:30' },
        { id: 'A102', name: '综合阅览区B', floor: 1, type: 'reading', x: 270, y: 50, width: 200, height: 150, currentDecibel: 58, status: 'warning', lastUpdated: '2026-06-07 09:45' },
        { id: 'A103', name: '自习区1', floor: 1, type: 'study', x: 50, y: 220, width: 180, height: 120, currentDecibel: 38, status: 'normal', lastUpdated: '2026-06-07 10:00' },
        { id: 'A104', name: '休息区', floor: 1, type: 'rest', x: 250, y: 220, width: 140, height: 120, currentDecibel: 72, status: 'alarm', lastUpdated: '2026-06-07 10:15' },
        { id: 'A105', name: '主走廊', floor: 1, type: 'corridor', x: 410, y: 50, width: 80, height: 290, currentDecibel: 45, status: 'normal', lastUpdated: '2026-06-07 09:00' },
        
        { id: 'A201', name: '文学阅览区A', floor: 2, type: 'reading', x: 50, y: 50, width: 200, height: 150, currentDecibel: 45, status: 'normal', lastUpdated: '2026-06-07 08:30' },
        { id: 'A202', name: '文学阅览区B', floor: 2, type: 'reading', x: 270, y: 50, width: 200, height: 150, currentDecibel: 68, status: 'alarm', lastUpdated: '2026-06-07 09:20' },
        { id: 'A203', name: '自习区2', floor: 2, type: 'study', x: 50, y: 220, width: 180, height: 120, currentDecibel: 40, status: 'normal', lastUpdated: '2026-06-07 08:45' },
        { id: 'A204', name: '走廊', floor: 2, type: 'corridor', x: 410, y: 50, width: 80, height: 290, currentDecibel: 48, status: 'normal', lastUpdated: '2026-06-07 09:10' },
        
        { id: 'A301', name: '科技阅览区A', floor: 3, type: 'reading', x: 50, y: 50, width: 200, height: 150, currentDecibel: 55, status: 'warning', lastUpdated: '2026-06-07 10:30' },
        { id: 'A302', name: '科技阅览区B', floor: 3, type: 'reading', x: 270, y: 50, width: 200, height: 150, currentDecibel: 42, status: 'normal', lastUpdated: '2026-06-07 10:00' },
        { id: 'A303', name: '自习区3', floor: 3, type: 'study', x: 50, y: 220, width: 180, height: 120, currentDecibel: 35, status: 'normal', lastUpdated: '2026-06-07 09:30' },
        { id: 'A304', name: '休息区2', floor: 3, type: 'rest', x: 250, y: 220, width: 140, height: 120, currentDecibel: 62, status: 'warning', lastUpdated: '2026-06-07 10:45' },
        { id: 'A305', name: '走廊', floor: 3, type: 'corridor', x: 410, y: 50, width: 80, height: 290, currentDecibel: 46, status: 'normal', lastUpdated: '2026-06-07 08:50' }
    ],

    reminders: [
        { id: 'R001', areaId: 'A104', areaName: '休息区', floor: 1, decibel: 72, priority: 'high', message: '噪声严重超标，请立即处理', createdAt: '2026-06-07 10:15', status: 'pending' },
        { id: 'R002', areaId: 'A202', areaName: '文学阅览区B', floor: 2, decibel: 68, priority: 'high', message: '噪声超过阈值，需要巡检', createdAt: '2026-06-07 09:20', status: 'pending' },
        { id: 'R003', areaId: 'A102', areaName: '综合阅览区B', floor: 1, decibel: 58, priority: 'medium', message: '噪声接近阈值，注意观察', createdAt: '2026-06-07 09:45', status: 'pending' },
        { id: 'R004', areaId: 'A301', areaName: '科技阅览区A', floor: 3, decibel: 55, priority: 'medium', message: '噪声接近阈值，注意观察', createdAt: '2026-06-07 10:30', status: 'pending' },
        { id: 'R005', areaId: 'A304', areaName: '休息区2', floor: 3, decibel: 62, priority: 'medium', message: '噪声接近阈值，注意观察', createdAt: '2026-06-07 10:45', status: 'pending' }
    ],

    inspections: [
        { id: 'I001', areaId: 'A101', areaName: '综合阅览区A', floor: 1, decibel: 42, note: '环境安静', inspector: '张馆员', createdAt: '2026-06-07 09:30' },
        { id: 'I002', areaId: 'A102', areaName: '综合阅览区B', floor: 1, decibel: 58, note: '读者讨论声音较大', inspector: '张馆员', createdAt: '2026-06-07 09:45' },
        { id: 'I003', areaId: 'A103', areaName: '自习区1', floor: 1, decibel: 38, note: '非常安静', inspector: '张馆员', createdAt: '2026-06-07 10:00' },
        { id: 'I004', areaId: 'A104', areaName: '休息区', floor: 1, decibel: 72, note: '有人大声打电话', inspector: '张馆员', createdAt: '2026-06-07 10:15' },
        { id: 'I005', areaId: 'A202', areaName: '文学阅览区B', floor: 2, decibel: 68, note: '多人讨论问题', inspector: '张馆员', createdAt: '2026-06-07 09:20' },
        { id: 'I006', areaId: 'A301', areaName: '科技阅览区A', floor: 3, decibel: 55, note: '键盘敲击声较多', inspector: '张馆员', createdAt: '2026-06-07 10:30' },
        { id: 'I007', areaId: 'A304', areaName: '休息区2', floor: 3, decibel: 62, note: '有人聊天', inspector: '张馆员', createdAt: '2026-06-07 10:45' }
    ],

    floorNames: {
        1: '1F 综合阅览区',
        2: '2F 文学阅览区',
        3: '3F 科技阅览区'
    },

    typeNames: {
        reading: '阅览区',
        study: '自习区',
        corridor: '走廊',
        rest: '休息区'
    },

    threshold: {
        warning: 51,
        alarm: 66
    }
};
