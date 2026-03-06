/**
 * ScaleManager: 画面サイズに関わらず1280x720の比率を維持してスケーリングするユーティリティ
 */
const ScaleManager = {
    GAME_WIDTH: 1280,
    GAME_HEIGHT: 720,
    containerId: 'game-container',
    scale: 1,
    offsetX: 0,
    offsetY: 0,

    init(containerId = 'game-container') {
        this.containerId = containerId;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const scaleX = windowWidth / this.GAME_WIDTH;
        const scaleY = windowHeight / this.GAME_HEIGHT;

        // レターボックス（画面内に収める）
        this.scale = Math.min(scaleX, scaleY);

        const newWidth = this.GAME_WIDTH * this.scale;
        const newHeight = this.GAME_HEIGHT * this.scale;

        this.offsetX = (windowWidth - newWidth) / 2;
        this.offsetY = (windowHeight - newHeight) / 2;

        container.style.width = `${this.GAME_WIDTH}px`;
        container.style.height = `${this.GAME_HEIGHT}px`;
        container.style.position = 'absolute';

        // Flexboxの中央寄せによるズレを防ぐため、top/leftを0にリセット
        container.style.top = '0';
        container.style.left = '0';

        // transformで一括縮小＆中央配置
        container.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
        container.style.transformOrigin = '0 0';
    },

    /**
     * マウス/タッチのスクリーン座標をゲーム内座標(1280x720基準)に変換する
     */
    getGamePoint(e) {
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = (clientX - this.offsetX) / this.scale;
        const y = (clientY - this.offsetY) / this.scale;

        return { x, y };
    }
};

/**
 * ゲームのメインロジック
 */
const GameManager = {
    currentStep: 1, // 現在はめるべきパーツ/ターゲットの番号
    totalSteps: 4,  // 全部で4パーツ
    isDragging: false,
    draggedElement: null,
    dragOffset: { x: 0, y: 0 },
    initialPositions: {}, // インベントリの初期位置を保存

    init() {
        ScaleManager.init();
        this.cacheInitialPositions();
        this.setupTargets();
        this.setupDragEvents();
    },

    cacheInitialPositions() {
        const parts = document.querySelectorAll('.draggable-part');
        const container = document.getElementById('game-container');
        const clearOverlay = document.getElementById('clear-overlay');

        // 1. Flexboxでレイアウトされた初期の画面座標を取得
        const scale = ScaleManager.scale;
        const containerRect = container.getBoundingClientRect();

        parts.forEach(part => {
            const rect = part.getBoundingClientRect();
            // スケールを考慮してゲーム内(1280x720)座標に変換
            const x = (rect.left - containerRect.left) / scale;
            const y = (rect.top - containerRect.top) / scale;

            this.initialPositions[part.id] = { x, y };
        });

        // 2. DOMツリー上でgame-container直下に移動し、絶対配置に変更
        // これによって inventory-area に制限されず自由にドラッグ可能になる
        parts.forEach(part => {
            const pos = this.initialPositions[part.id];

            part.style.position = 'absolute';
            part.style.margin = '0';
            part.style.left = `${pos.x}px`;
            part.style.top = `${pos.y}px`;

            container.insertBefore(part, clearOverlay);
        });
    },

    setupTargets() {
        // 最初のターゲットだけアクティブにする
        this.updateActiveTarget();
    },

    updateActiveTarget() {
        document.querySelectorAll('.drop-target').forEach(target => {
            target.classList.remove('active-target');
            if (parseInt(target.dataset.step) === this.currentStep) {
                target.classList.add('active-target');
            }
        });
    },

    setupDragEvents() {
        const parts = document.querySelectorAll('.draggable-part');
        const container = document.getElementById('game-container');

        parts.forEach(part => {
            part.addEventListener('mousedown', (e) => this.dragStart(e, part), { passive: false });
            part.addEventListener('touchstart', (e) => this.dragStart(e, part), { passive: false });
        });

        // document全体でムーブとエンドを監視
        document.addEventListener('mousemove', (e) => this.dragMove(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.dragMove(e), { passive: false });

        document.addEventListener('mouseup', (e) => this.dragEnd(e));
        document.addEventListener('touchend', (e) => this.dragEnd(e));
    },

    dragStart(e, element) {
        // すでにスナップ済みのパーツは動かさない
        if (element.classList.contains('snapped')) return;

        // 現在のステップ以外のパーツは掴めない（あるいは掴めるけど正解にならないようにする）
        // ※今回は「触れるけど弾かれる」方がゲームっぽいので掴めるようにしておく

        this.isDragging = true;
        this.draggedElement = element;

        // Zインデックスを上げて最前面に
        element.style.zIndex = '100';

        const pt = ScaleManager.getGamePoint(e);

        // 要素の現在のXY（ゲーム座標）
        const elX = parseFloat(element.style.left) || 0;
        const elY = parseFloat(element.style.top) || 0;

        // ポインター位置と要素の左上との差分を記録
        this.dragOffset.x = pt.x - elX;
        this.dragOffset.y = pt.y - elY;
    },

    dragMove(e) {
        if (!this.isDragging || !this.draggedElement) return;
        e.preventDefault(); // デフォルトスワイプ防止

        const pt = ScaleManager.getGamePoint(e);

        // オフセットを引いた位置に移動
        let newX = pt.x - this.dragOffset.x;
        let newY = pt.y - this.dragOffset.y;

        // 画面外に出ないように制限（簡易的）
        // newX = Math.max(0, Math.min(newX, ScaleManager.GAME_WIDTH - this.draggedElement.offsetWidth));
        // newY = Math.max(0, Math.min(newY, ScaleManager.GAME_HEIGHT - this.draggedElement.offsetHeight));

        this.draggedElement.style.left = `${newX}px`;
        this.draggedElement.style.top = `${newY}px`;
    },

    dragEnd(e) {
        if (!this.isDragging || !this.draggedElement) return;

        this.isDragging = false;

        // ドロップ判定
        const isMatched = this.checkDrop(this.draggedElement);

        if (isMatched) {
            // 正解の挙動
            this.handleSuccessDrop(this.draggedElement);
        } else {
            // 不正解・元の位置に戻る
            this.handleFailDrop(this.draggedElement);
        }

        this.draggedElement.style.zIndex = '10';
        this.draggedElement = null;
    },

    checkDrop(element) {
        const partId = parseInt(element.dataset.id);

        if (partId !== this.currentStep) return false;

        const target = document.querySelector(`.drop-target[data-step="${this.currentStep}"]`);
        if (!target) return false;

        // ドラッグ要素とターゲットは同じ game-container 内にあるので、直接座標比較が可能
        const elRect = {
            left: parseFloat(element.style.left) || 0,
            top: parseFloat(element.style.top) || 0,
            width: element.offsetWidth,
            height: element.offsetHeight
        };
        const elCenter = {
            x: elRect.left + elRect.width / 2,
            y: elRect.top + elRect.height / 2
        };

        const tRect = {
            left: target.offsetLeft + 40, // ターゲットはassembly-area(left:40, top:40)に属しているため補正
            top: target.offsetTop + 40,
            width: target.offsetWidth,
            height: target.offsetHeight
        };
        const tCenter = {
            x: tRect.left + tRect.width / 2,
            y: tRect.top + tRect.height / 2
        };

        // 判定距離（中心点同士の距離）
        const distance = Math.hypot(elCenter.x - tCenter.x, elCenter.y - tCenter.y);
        const hitRadius = 150; // 少し広めに判定

        return distance < hitRadius;
    },

    handleSuccessDrop(element) {
        const target = document.querySelector(`.drop-target[data-step="${this.currentStep}"]`);

        // ターゲットの位置にピタッと合わせる
        // ターゲットはassembly-area(+40, +40)内にあるため座標を補正
        const tLeft = target.offsetLeft + 40;
        const tTop = target.offsetTop + 40;
        const tWidth = target.offsetWidth;
        const tHeight = target.offsetHeight;

        const elWidth = element.offsetWidth;
        const elHeight = element.offsetHeight;

        // ターゲットの中心にパーツの中心を合わせる座標
        const snapX = tLeft + (tWidth - elWidth) / 2;
        const snapY = tTop + (tHeight - elHeight) / 2;

        element.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        element.style.left = `${snapX}px`;
        element.style.top = `${snapY}px`;

        // 成功状態をつける
        element.classList.add('snapped');
        target.classList.remove('active-target');

        // SE再生 (任意)
        const se = document.getElementById('se-snap');
        if (se) {
            se.currentTime = 0;
            se.play().catch(e => console.log("Audio play blocked."));
        }

        // 次のステップへ
        this.currentStep++;

        if (this.currentStep > this.totalSteps) {
            this.handleGameClear();
        } else {
            this.updateActiveTarget();
        }

        // トランジション終わったら元に戻す(次回掴んだ時用、今回はもう掴めないので不要だけど一応)
        setTimeout(() => {
            element.style.transition = 'transform 0.1s';
        }, 300);
    },

    handleFailDrop(element) {
        // 初期位置に戻るアニメーション
        const initial = this.initialPositions[element.id];

        element.style.transition = 'all 0.4s ease-out';
        element.style.left = `${initial.x}px`;
        element.style.top = `${initial.y}px`;

        setTimeout(() => {
            element.style.transition = 'transform 0.1s';
        }, 400);
    },

    handleGameClear() {
        console.log("Game Clear!");

        const se = document.getElementById('se-clear');
        if (se) {
            se.currentTime = 0;
            se.play().catch(e => console.log("Audio play blocked."));
        }

        // 少し待ってからクリア画面
        setTimeout(() => {
            document.getElementById('clear-overlay').classList.remove('hidden');

            // ティラノビルダー連携用（必要に応じて）
            // if(window.parent && window.parent.TYRANO) {
            //     window.parent.TYRANO.kag.stat.f["respirator_cleared"] = true;
            //     window.parent.TYRANO.kag.ftag.startTag("jump", {target: "*cleared"});
            // }
        }, 1000);
    }
};

// 起動
document.addEventListener('DOMContentLoaded', () => {
    GameManager.init();
});
