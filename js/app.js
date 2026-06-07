const STORAGE_KEYS = {
    CURRENT_ROLE: 'library_noise_current_role',
    AREAS: 'library_noise_areas',
    REMINDERS: 'library_noise_reminders',
    INSPECTIONS: 'library_noise_inspections'
};

let appState = {
    currentRole: 'reader',
    currentUser: null,
    currentFloor: 1,
    areas: [],
    reminders: [],
    inspections: [],
    filters: {
        floor: 'all',
        status: 'all',
        type: 'all'
    }
};

function initApp() {
    try {
        loadFromStorage();
    } catch (e) {
        console.error('initApp: loadFromStorage failed, using defaults:', e);
        appState.currentRole = 'reader';
        appState.currentUser = MOCK_DATA.users.reader;
        appState.areas = JSON.parse(JSON.stringify(MOCK_DATA.areas));
        appState.reminders = JSON.parse(JSON.stringify(MOCK_DATA.reminders));
        appState.inspections = JSON.parse(JSON.stringify(MOCK_DATA.inspections));
    }
    
    if (!appState.currentUser) {
        appState.currentUser = MOCK_DATA.users[appState.currentRole] || MOCK_DATA.users.reader;
    }
    
    initEventListeners();
    renderUI();
    updateTrendCards();
    showToast('欢迎使用图书馆噪声巡检系统', 'info');
}

function loadFromStorage() {
    try {
        const savedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE);
        if (savedRole && (savedRole === 'reader' || savedRole === 'librarian')) {
            appState.currentRole = savedRole;
        } else {
            appState.currentRole = 'reader';
        }

        const savedAreas = localStorage.getItem(STORAGE_KEYS.AREAS);
        if (savedAreas) {
            try {
                appState.areas = JSON.parse(savedAreas);
            } catch (e) {
                console.warn('Failed to parse saved areas, using default:', e);
                appState.areas = JSON.parse(JSON.stringify(MOCK_DATA.areas));
                saveToStorage(STORAGE_KEYS.AREAS, appState.areas);
            }
        } else {
            appState.areas = JSON.parse(JSON.stringify(MOCK_DATA.areas));
            saveToStorage(STORAGE_KEYS.AREAS, appState.areas);
        }

        const savedReminders = localStorage.getItem(STORAGE_KEYS.REMINDERS);
        if (savedReminders) {
            try {
                appState.reminders = JSON.parse(savedReminders);
            } catch (e) {
                console.warn('Failed to parse saved reminders, using default:', e);
                appState.reminders = JSON.parse(JSON.stringify(MOCK_DATA.reminders));
                saveToStorage(STORAGE_KEYS.REMINDERS, appState.reminders);
            }
        } else {
            appState.reminders = JSON.parse(JSON.stringify(MOCK_DATA.reminders));
            saveToStorage(STORAGE_KEYS.REMINDERS, appState.reminders);
        }

        const savedInspections = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
        if (savedInspections) {
            try {
                appState.inspections = JSON.parse(savedInspections);
            } catch (e) {
                console.warn('Failed to parse saved inspections, using default:', e);
                appState.inspections = JSON.parse(JSON.stringify(MOCK_DATA.inspections));
                saveToStorage(STORAGE_KEYS.INSPECTIONS, appState.inspections);
            }
        } else {
            appState.inspections = JSON.parse(JSON.stringify(MOCK_DATA.inspections));
            saveToStorage(STORAGE_KEYS.INSPECTIONS, appState.inspections);
        }

        appState.currentUser = MOCK_DATA.users[appState.currentRole];
        if (!appState.currentUser) {
            appState.currentUser = MOCK_DATA.users.reader;
            appState.currentRole = 'reader';
        }
    } catch (e) {
        console.error('Error loading from storage:', e);
        appState.currentRole = 'reader';
        appState.areas = JSON.parse(JSON.stringify(MOCK_DATA.areas));
        appState.reminders = JSON.parse(JSON.stringify(MOCK_DATA.reminders));
        appState.inspections = JSON.parse(JSON.stringify(MOCK_DATA.inspections));
        appState.currentUser = MOCK_DATA.users.reader;
    }
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function initEventListeners() {
    document.getElementById('roleSelect').addEventListener('change', (e) => {
        switchRole(e.target.value);
    });

    document.getElementById('floorFilter').addEventListener('change', (e) => {
        appState.filters.floor = e.target.value;
    });

    document.getElementById('statusFilter').addEventListener('change', (e) => {
        appState.filters.status = e.target.value;
    });

    document.getElementById('typeFilter').addEventListener('change', (e) => {
        appState.filters.type = e.target.value;
    });

    document.getElementById('applyFilter').addEventListener('click', () => {
        renderFloorMap();
        renderReminderList();
        showToast('筛选条件已应用', 'success');
    });

    document.getElementById('resetFilter').addEventListener('click', () => {
        appState.filters = { floor: 'all', status: 'all', type: 'all' };
        document.getElementById('floorFilter').value = 'all';
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('typeFilter').value = 'all';
        renderFloorMap();
        renderReminderList();
        showToast('筛选条件已重置', 'info');
    });

    document.getElementById('noiseEntryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        submitNoiseEntry();
    });

    document.getElementById('addAreaBtn').addEventListener('click', () => {
        openAreaModal();
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
        exportInspectionData();
    });

    document.getElementById('clearDataBtn').addEventListener('click', () => {
        if (confirm('确定要清空所有本地数据吗？此操作不可恢复。')) {
            clearAllData();
        }
    });

    document.getElementById('closeModal').addEventListener('click', closeAreaModal);
    document.getElementById('cancelAreaBtn').addEventListener('click', closeAreaModal);
    document.getElementById('areaModal').addEventListener('click', (e) => {
        if (e.target.id === 'areaModal') {
            closeAreaModal();
        }
    });

    document.getElementById('areaForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveArea();
    });

    document.querySelectorAll('.floor-map').forEach(map => {
        map.addEventListener('click', (e) => {
            if (e.target.classList.contains('map-area')) {
                const areaId = e.target.dataset.areaId;
                handleAreaClick(areaId);
            }
        });
    });
}

function switchRole(role) {
    appState.currentRole = role;
    appState.currentUser = MOCK_DATA.users[role];
    saveToStorage(STORAGE_KEYS.CURRENT_ROLE, role);
    document.getElementById('roleSelect').value = role;
    renderUI();
    showToast(`已切换到${role === 'librarian' ? '馆员' : '读者'}角色`, 'info');
}

function renderUI() {
    if (!appState.currentUser) {
        appState.currentUser = MOCK_DATA.users[appState.currentRole] || MOCK_DATA.users.reader;
    }
    document.getElementById('currentUser').textContent = `${appState.currentUser.name} (${appState.currentUser.role === 'librarian' ? '馆员' : '读者'})`;

    const body = document.body;
    body.classList.remove('librarian-view', 'reader-view');
    if (appState.currentRole === 'librarian') {
        body.classList.add('librarian-view');
        document.getElementById('librarianActions').style.display = 'block';
        document.getElementById('noiseEntryPanel').style.display = 'block';
    } else {
        body.classList.add('reader-view');
        document.getElementById('librarianActions').style.display = 'none';
        document.getElementById('noiseEntryPanel').style.display = 'none';
    }

    renderFloorMap();
    renderAreaSelect();
    renderReminderList();
    updateTrendCards();
}

function getStatusFromDecibel(decibel) {
    if (decibel >= MOCK_DATA.threshold.alarm) return 'alarm';
    if (decibel >= MOCK_DATA.threshold.warning) return 'warning';
    return 'normal';
}

function getFilteredAreas() {
    return appState.areas.filter(area => {
        if (appState.filters.floor !== 'all' && area.floor !== parseInt(appState.filters.floor)) return false;
        if (appState.filters.status !== 'all' && area.status !== appState.filters.status) return false;
        if (appState.filters.type !== 'all' && area.type !== appState.filters.type) return false;
        return true;
    });
}

function renderFloorMap() {
    const mapContainer = document.getElementById('floorMap');
    const floorName = MOCK_DATA.floorNames[appState.currentFloor];
    document.getElementById('mapTitle').textContent = `${floorName} - 噪声分布地图`;
    document.getElementById('currentFloor').textContent = floorName;

    const floorAreas = getFilteredAreas().filter(area => area.floor === appState.currentFloor);

    let svg = `<svg viewBox="0 0 500 350" preserveAspectRatio="xMidYMid meet">`;

    svg += `<rect x="10" y="10" width="480" height="330" fill="#f8f9fa" stroke="#bdc3c7" stroke-width="2" rx="8"/>`;
    svg += `<text x="250" y="30" text-anchor="middle" fill="#7f8c8d" font-size="12">${floorName} 平面图</text>`;

    floorAreas.forEach(area => {
        const statusClass = area.status;
        const flashingClass = area.status === 'alarm' ? 'flashing' : '';
        
        svg += `<rect class="map-area ${statusClass} ${flashingClass}" 
                    data-area-id="${area.id}"
                    x="${area.x}" y="${area.y}" 
                    width="${area.width}" height="${area.height}"
                    rx="4"/>`;
        
        const centerX = area.x + area.width / 2;
        const centerY = area.y + area.height / 2;
        
        svg += `<text class="area-label" x="${centerX}" y="${centerY - 5}">${area.name}</text>`;
        svg += `<text class="area-decibel" x="${centerX}" y="${centerY + 15}">${area.currentDecibel} dB</text>`;
    });

    svg += `</svg>`;
    mapContainer.innerHTML = svg;

    mapContainer.querySelectorAll('.map-area').forEach(rect => {
        rect.addEventListener('click', () => {
            const areaId = rect.dataset.areaId;
            handleAreaClick(areaId);
        });
    });

    const floorBtns = document.querySelectorAll('.floor-btn');
    floorBtns.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.floor) === appState.currentFloor) {
            btn.classList.add('active');
        }
    });
}

function handleAreaClick(areaId) {
    const area = appState.areas.find(a => a.id === areaId);
    if (!area) return;

    if (appState.currentRole === 'librarian') {
        document.getElementById('entryArea').value = areaId;
        showToast(`已选择 ${area.name}，当前 ${area.currentDecibel} dB`, 'info');
    } else {
        showToast(`${area.name}: ${area.currentDecibel} dB (${getStatusText(area.status)})`, 'info');
    }
}

function getStatusText(status) {
    const texts = { normal: '正常', warning: '预警', alarm: '告警' };
    return texts[status] || status;
}

function renderAreaSelect() {
    const select = document.getElementById('entryArea');
    const areas = appState.areas.filter(a => a.floor === appState.currentFloor);
    
    select.innerHTML = '<option value="">请选择区域</option>';
    areas.forEach(area => {
        select.innerHTML += `<option value="${area.id}">${area.name} (当前: ${area.currentDecibel}dB)</option>`;
    });
}

function submitNoiseEntry() {
    const areaId = document.getElementById('entryArea').value;
    const decibel = parseInt(document.getElementById('entryDecibel').value);
    const note = document.getElementById('entryNote').value;
    const responseEl = document.getElementById('entryResponse');

    if (!areaId) {
        showResponse(responseEl, '请选择区域', false);
        return;
    }

    if (isNaN(decibel) || decibel < 0 || decibel > 120) {
        showResponse(responseEl, '请输入有效的分贝值 (0-120)', false);
        return;
    }

    const area = appState.areas.find(a => a.id === areaId);
    if (!area) {
        showResponse(responseEl, '区域不存在', false);
        return;
    }

    const oldStatus = area.status;
    const newStatus = getStatusFromDecibel(decibel);
    const statusChanged = oldStatus !== newStatus;

    area.currentDecibel = decibel;
    area.status = newStatus;
    area.lastUpdated = new Date().toLocaleString('zh-CN');

    const inspection = {
        id: 'I' + Date.now(),
        areaId: area.id,
        areaName: area.name,
        floor: area.floor,
        decibel: decibel,
        note: note,
        inspector: appState.currentUser.name,
        createdAt: new Date().toLocaleString('zh-CN')
    };
    appState.inspections.unshift(inspection);

    if (newStatus === 'alarm' || newStatus === 'warning') {
        const existingReminder = appState.reminders.find(r => r.areaId === areaId && r.status === 'pending');
        if (!existingReminder) {
            const reminder = {
                id: 'R' + Date.now(),
                areaId: area.id,
                areaName: area.name,
                floor: area.floor,
                decibel: decibel,
                priority: newStatus === 'alarm' ? 'high' : 'medium',
                message: newStatus === 'alarm' ? '噪声严重超标，请立即处理' : '噪声接近阈值，注意观察',
                createdAt: new Date().toLocaleString('zh-CN'),
                status: 'pending'
            };
            appState.reminders.unshift(reminder);
        } else {
            existingReminder.decibel = decibel;
            existingReminder.priority = newStatus === 'alarm' ? 'high' : 'medium';
            existingReminder.createdAt = new Date().toLocaleString('zh-CN');
        }
    }

    saveToStorage(STORAGE_KEYS.AREAS, appState.areas);
    saveToStorage(STORAGE_KEYS.INSPECTIONS, appState.inspections);
    saveToStorage(STORAGE_KEYS.REMINDERS, appState.reminders);

    let successMsg = `录入成功！${area.name}: ${decibel} dB`;
    if (statusChanged) {
        successMsg += ` 状态从"${getStatusText(oldStatus)}"变为"${getStatusText(newStatus)}"`;
    }
    
    if (newStatus === 'alarm') {
        successMsg += ' ⚠️ 已创建告警提醒！';
    }

    showResponse(responseEl, successMsg, true);
    showToast(successMsg, newStatus === 'alarm' ? 'warning' : 'success');

    document.getElementById('noiseEntryForm').reset();
    renderUI();
    updateTrendCards();
}

function showResponse(element, message, isSuccess) {
    element.textContent = message;
    element.className = 'response-message ' + (isSuccess ? 'success' : 'error');
    
    setTimeout(() => {
        element.className = 'response-message';
    }, 5000);
}

function renderReminderList() {
    const listEl = document.getElementById('reminderList');
    const badgeEl = document.getElementById('reminderBadge');
    
    let filteredReminders = appState.reminders.filter(r => r.status === 'pending');
    
    if (appState.filters.floor !== 'all') {
        filteredReminders = filteredReminders.filter(r => r.floor === parseInt(appState.filters.floor));
    }
    if (appState.filters.status !== 'all') {
        filteredReminders = filteredReminders.filter(r => {
            const reminderStatus = r.decibel >= MOCK_DATA.threshold.alarm ? 'alarm' : 'warning';
            return reminderStatus === appState.filters.status;
        });
    }

    badgeEl.textContent = filteredReminders.length;

    if (filteredReminders.length === 0) {
        listEl.innerHTML = '<div class="empty-state">🎉 暂无待处理提醒</div>';
        return;
    }

    listEl.innerHTML = filteredReminders.map(reminder => {
        const priorityClass = `priority-${reminder.priority}`;
        const actionButtons = appState.currentRole === 'librarian' ? `
            <div class="reminder-actions">
                <button class="btn btn-success-sm" onclick="handleReminder('${reminder.id}', 'success')">✓ 已处理</button>
                <button class="btn btn-danger-sm" onclick="handleReminder('${reminder.id}', 'fail')">✗ 处理失败</button>
            </div>
        ` : '';

        return `
            <div class="reminder-item ${priorityClass}" data-reminder-id="${reminder.id}">
                <div class="reminder-content">
                    <div class="reminder-title">
                        ${reminder.priority === 'high' ? '🔴' : '🟡'} 
                        ${reminder.areaName} - ${reminder.decibel} dB
                    </div>
                    <div class="reminder-meta">
                        ${MOCK_DATA.floorNames[reminder.floor]} | ${reminder.message} | ${reminder.createdAt}
                    </div>
                </div>
                ${actionButtons}
            </div>
        `;
    }).join('');
}

function handleReminder(reminderId, result) {
    const reminder = appState.reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    const area = appState.areas.find(a => a.id === reminder.areaId);
    
    if (result === 'success') {
        reminder.status = 'resolved';
        reminder.resolvedAt = new Date().toLocaleString('zh-CN');
        reminder.resolvedBy = appState.currentUser.name;
        
        if (area) {
            area.currentDecibel = Math.min(area.currentDecibel, 45);
            area.status = getStatusFromDecibel(area.currentDecibel);
            area.lastUpdated = new Date().toLocaleString('zh-CN');
        }
        
        showToast(`✅ ${reminder.areaName} 处理成功，噪声已恢复正常`, 'success');
        
        const inspection = {
            id: 'I' + Date.now(),
            areaId: reminder.areaId,
            areaName: reminder.areaName,
            floor: reminder.floor,
            decibel: 45,
            note: '巡检处理完成，噪声恢复正常',
            inspector: appState.currentUser.name,
            createdAt: new Date().toLocaleString('zh-CN')
        };
        appState.inspections.unshift(inspection);
        
    } else {
        reminder.status = 'failed';
        reminder.failedAt = new Date().toLocaleString('zh-CN');
        reminder.failedBy = appState.currentUser.name;
        reminder.failedReason = '处理失败，需要重新安排巡检';
        
        showToast(`❌ ${reminder.areaName} 处理失败，将重新安排巡检`, 'error');
        
        const newReminder = {
            id: 'R' + Date.now(),
            areaId: reminder.areaId,
            areaName: reminder.areaName,
            floor: reminder.floor,
            decibel: reminder.decibel,
            priority: 'high',
            message: '重新安排巡检 - 上次处理失败',
            createdAt: new Date().toLocaleString('zh-CN'),
            status: 'pending'
        };
        appState.reminders.unshift(newReminder);
    }

    const reminderEl = document.querySelector(`[data-reminder-id="${reminderId}"]`);
    if (reminderEl) {
        reminderEl.style.animation = 'slideUp 0.3s ease reverse';
        setTimeout(() => {
            reminderEl.style.opacity = '0.5';
        }, 300);
    }

    saveToStorage(STORAGE_KEYS.REMINDERS, appState.reminders);
    saveToStorage(STORAGE_KEYS.AREAS, appState.areas);
    saveToStorage(STORAGE_KEYS.INSPECTIONS, appState.inspections);

    setTimeout(() => {
        renderUI();
        updateTrendCards();
    }, 500);
}

function updateTrendCards() {
    const allDecibels = appState.areas.map(a => a.currentDecibel);
    const avgDecibel = allDecibels.length > 0 
        ? Math.round(allDecibels.reduce((a, b) => a + b, 0) / allDecibels.length) 
        : 0;

    const warningCount = appState.areas.filter(a => a.status === 'warning').length;
    const alarmCount = appState.areas.filter(a => a.status === 'alarm').length;

    const today = new Date().toLocaleDateString('zh-CN');
    const todayInspections = appState.inspections.filter(i => i.createdAt.startsWith(today)).length;

    document.getElementById('avgDecibel').textContent = avgDecibel + ' dB';
    document.getElementById('warningCount').textContent = warningCount;
    document.getElementById('alarmCount').textContent = alarmCount;
    document.getElementById('todayInspections').textContent = todayInspections;
}

function openAreaModal(areaId = null) {
    const modal = document.getElementById('areaModal');
    const title = document.getElementById('modalTitle');
    
    document.getElementById('areaForm').reset();
    document.getElementById('areaId').value = '';

    if (areaId) {
        const area = appState.areas.find(a => a.id === areaId);
        if (area) {
            title.textContent = '编辑阅览区';
            document.getElementById('areaId').value = area.id;
            document.getElementById('areaName').value = area.name;
            document.getElementById('areaFloor').value = area.floor;
            document.getElementById('areaType').value = area.type;
            document.getElementById('areaX').value = area.x;
            document.getElementById('areaY').value = area.y;
            document.getElementById('areaWidth').value = area.width;
            document.getElementById('areaHeight').value = area.height;
        }
    } else {
        title.textContent = '新增阅览区';
    }

    modal.classList.add('show');
}

function closeAreaModal() {
    document.getElementById('areaModal').classList.remove('show');
}

function saveArea() {
    const areaId = document.getElementById('areaId').value;
    const areaData = {
        name: document.getElementById('areaName').value,
        floor: parseInt(document.getElementById('areaFloor').value),
        type: document.getElementById('areaType').value,
        x: parseInt(document.getElementById('areaX').value),
        y: parseInt(document.getElementById('areaY').value),
        width: parseInt(document.getElementById('areaWidth').value),
        height: parseInt(document.getElementById('areaHeight').value)
    };

    if (areaId) {
        const index = appState.areas.findIndex(a => a.id === areaId);
        if (index !== -1) {
            appState.areas[index] = { ...appState.areas[index], ...areaData };
            showToast('阅览区更新成功', 'success');
        }
    } else {
        const newArea = {
            id: 'A' + Date.now(),
            ...areaData,
            currentDecibel: 40,
            status: 'normal',
            lastUpdated: new Date().toLocaleString('zh-CN')
        };
        appState.areas.push(newArea);
        showToast('阅览区创建成功', 'success');
    }

    saveToStorage(STORAGE_KEYS.AREAS, appState.areas);
    closeAreaModal();
    renderUI();
}

function exportInspectionData() {
    const data = {
        exportDate: new Date().toLocaleString('zh-CN'),
        exportedBy: appState.currentUser.name,
        areas: appState.areas,
        reminders: appState.reminders,
        inspections: appState.inspections,
        statistics: {
            totalAreas: appState.areas.length,
            normalAreas: appState.areas.filter(a => a.status === 'normal').length,
            warningAreas: appState.areas.filter(a => a.status === 'warning').length,
            alarmAreas: appState.areas.filter(a => a.status === 'alarm').length,
            totalInspections: appState.inspections.length,
            pendingReminders: appState.reminders.filter(r => r.status === 'pending').length
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `噪声巡检数据_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    let csv = '区域,楼层,分贝值,状态,巡检员,时间,备注\n';
    appState.inspections.forEach(ins => {
        csv += `"${ins.areaName}","${MOCK_DATA.floorNames[ins.floor]}",${ins.decibel},"${getStatusText(getStatusFromDecibel(ins.decibel))}","${ins.inspector}","${ins.createdAt}","${ins.note || ''}"\n`;
    });

    const csvBlob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvA = document.createElement('a');
    csvA.href = csvUrl;
    csvA.download = `噪声巡检记录_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(csvA);
    csvA.click();
    document.body.removeChild(csvA);
    URL.revokeObjectURL(csvUrl);

    showToast('巡检数据导出成功 (JSON + CSV)', 'success');
}

function clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.AREAS);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    localStorage.removeItem(STORAGE_KEYS.INSPECTIONS);
    
    appState.areas = JSON.parse(JSON.stringify(MOCK_DATA.areas));
    appState.reminders = JSON.parse(JSON.stringify(MOCK_DATA.reminders));
    appState.inspections = JSON.parse(JSON.stringify(MOCK_DATA.inspections));
    
    saveToStorage(STORAGE_KEYS.AREAS, appState.areas);
    saveToStorage(STORAGE_KEYS.REMINDERS, appState.reminders);
    saveToStorage(STORAGE_KEYS.INSPECTIONS, appState.inspections);
    
    renderUI();
    updateTrendCards();
    showToast('数据已重置为初始状态', 'info');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function setFloor(floor) {
    appState.currentFloor = floor;
    renderUI();
}

document.addEventListener('DOMContentLoaded', initApp);
