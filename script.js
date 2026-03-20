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
 * シナリオデータ定義
 */
const SCENARIO_DATA = [
    { type: 'dialogue', speaker: 'Satou', text: 'じゃあ回路をくんでみよう。下段にある機材を上段の正しい位置にドラッグするんだ。', voice: 'sato_1' },
    { type: 'dialogue', speaker: 'Satou', text: '最初は僕がやってみせるね。', voice: 'sato_2' },
    { type: 'dialogue', speaker: 'Satou', text: 'まず下段の人工呼吸器をつかんでと・・・', voice: 'sato_3' },
    { type: 'auto_drag', target: 1 }, // respirator
    { type: 'dialogue', speaker: 'Satou', text: '人工呼吸器はここだとします。', voice: 'sato_4' },
    { type: 'dialogue', speaker: 'Takei', text: 'なるほど。', voice: 'takei_1' },
    { type: 'dialogue', speaker: 'Satou', text: 'テスト肺も置いておくね。これを患者さんだと思ってください。', voice: 'sato_5' },
    { type: 'auto_drag', target: 2 }, // bag
    { type: 'dialogue', speaker: 'Satou', text: '呼吸器の回路を辿っていこう。', voice: 'sato_6' },
    { type: 'dialogue', speaker: 'Satou', text: 'まず呼吸器の出口にはバクテリアフィルターをつけます。それを掴んで正しい位置にドラッグしてみよう。', voice: 'sato_7' },
    { type: 'dialogue', speaker: 'Takei', text: 'やってみます！', voice: 'takei_2' },
    { type: 'wait_drag', target: 4 }, // filter
    { type: 'dialogue', speaker: 'Satou', text: 'OK！その調子', voice: 'sato_8' },
    { type: 'dialogue', speaker: 'Satou', text: '次は短い呼吸回路だね。呼吸器と加温加湿器をつなぐんだ。', voice: 'sato_9' },
    { type: 'wait_drag', target: 8 }, // kairo2
    { type: 'dialogue', speaker: 'Satou', text: '次は加温加湿器をセットしよう。', voice: 'sato_10' },
    { type: 'wait_drag', target: 5 }, // humidifier1
    { type: 'dialogue', speaker: 'Satou', text: '加温加湿器に加湿チャンバーをセットしてみよう', voice: 'sato_11' },
    { type: 'wait_drag', target: 6 }, // humidifier2
    { type: 'dialogue', speaker: 'Takei', text: 'こうですね！', voice: 'takei_3' },
    { type: 'dialogue', speaker: 'Satou', text: 'これで呼吸器から出てきた空気が加温加湿されるんだ。', voice: 'sato_12' },
    { type: 'dialogue', speaker: 'Takei', text: 'なるほど', voice: 'takei_4' },
    { type: 'dialogue', speaker: 'Satou', text: '次は加温加湿器から出て、患者さんにつなぐ回路を繋いでみよう。患者さんから呼吸器に戻る回路とセットになってるよ。', voice: 'sato_13' },
    { type: 'dialogue', speaker: 'Takei', text: 'やってみます！', voice: 'takei_5' },
    { type: 'wait_drag', target: 7 }, // kairo1
    { type: 'dialogue', speaker: 'Satou', text: 'いいね！次はコネクターを繋ごう。柔らかい管で、患者さんの動きを和らげる働きをするよ。', voice: 'sato_14' },
    { type: 'dialogue', speaker: 'Takei', text: 'なるほどー', voice: 'takei_6' },
    { type: 'wait_drag', target: 3 }, // connect
    { type: 'dialogue', speaker: 'Satou', text: 'これで完成！', voice: 'sato_15' },
    { type: 'dialogue', speaker: 'Takei', text: 'ありがとうございました！', voice: 'takei_7' }
];

/**
 * シナリオ進行・UI管理
 */
const ScenarioManager = {
    currentIndex: 0,
    isAnimatingText: false,
    textInterval: null,

    init() {
        this.overlay = document.getElementById('dialogue-overlay');
        this.box = document.getElementById('dialogue-box');
        this.speakerName = document.getElementById('speaker-name');
        this.dialogueText = document.getElementById('dialogue-text');
        this.charSatou = document.getElementById('char-satou');
        this.charTakei = document.getElementById('char-takei');

        // ダイアログクリックで進行
        this.box.addEventListener('click', () => this.handleBoxClick());
    },

    startScenerio() {
        this.currentIndex = 0;
        this.processStep();
    },

    processStep() {
        if (this.currentIndex >= SCENARIO_DATA.length) {
            this.overlay.classList.add('hidden');
            this.setCharactersState(null);
            document.body.classList.remove('dialogue-active');
            GameManager.handleGameClear();
            return;
        }

        const step = SCENARIO_DATA[this.currentIndex];

        if (step.type === 'dialogue') {
            this.showDialogue(step);
        } else if (step.type === 'auto_drag') {
            this.hideDialogue();
            document.body.classList.add('dialogue-active');
            GameManager.executeAutoDrag(step.target, () => {
                this.currentIndex++;
                this.processStep();
            });
        } else if (step.type === 'wait_drag') {
            this.hideDialogue();
            document.body.classList.remove('dialogue-active');
            GameManager.setWaitTarget(step.target);
            // ユーザーがドラッグ成功するまで待機（GameManagerから呼ばれる）
        }
    },

    pendingVoice: null,

    playVoice(voiceId) {
        // 再生中のボイスを止める
        document.querySelectorAll('audio.character-voice').forEach(v => {
            if (!v.paused) {
                v.pause();
                v.currentTime = 0;
            }
        });
        if (voiceId) {
            const voice = document.getElementById(voiceId);
            if (voice) {
                voice.currentTime = 0;
                voice.play().catch(() => { });
            }
        }
    },

    playPendingVoice() {
        if (this.pendingVoice) {
            const voice = document.getElementById(this.pendingVoice);
            if (voice) {
                voice.currentTime = 0;
                voice.play().catch(() => { });
            }
            this.pendingVoice = null;
        }
    },

    showDialogue(step) {
        document.body.classList.add('dialogue-active');
        this.overlay.classList.remove('hidden');

        this.speakerName.textContent = step.speaker;
        this.setCharactersState(step.speaker);

        // ボイス再生
        this.playVoice(step.voice || null);

        // テキストアニメーション
        this.dialogueText.textContent = '';
        this.isAnimatingText = true;
        let charIndex = 0;
        const text = step.text;

        clearInterval(this.textInterval);
        this.textInterval = setInterval(() => {
            this.dialogueText.textContent += text.charAt(charIndex);
            charIndex++;
            if (charIndex >= text.length) {
                this.finishText(text);
            }
        }, 30); // 1文字30ms
    },

    finishText(fullText) {
        clearInterval(this.textInterval);
        this.dialogueText.textContent = fullText;
        this.isAnimatingText = false;
    },

    hideDialogue() {
        this.overlay.classList.add('hidden');
    },

    setCharactersState(speaker) {
        // 全員表示＆リセット
        this.charSatou.classList.remove('hidden', 'talking');
        this.charTakei.classList.remove('hidden', 'talking');

        if (speaker === 'Satou') {
            this.charSatou.classList.add('talking');
        } else if (speaker === 'Takei') {
            this.charTakei.classList.add('talking');
        }
    },

    handleBoxClick() {
        if (this.isAnimatingText) {
            // アニメーションスキップ
            const step = SCENARIO_DATA[this.currentIndex];
            this.finishText(step.text);
        } else {
            // 次のステップへ
            const step = SCENARIO_DATA[this.currentIndex];
            if (step && step.type === 'dialogue') {
                this.currentIndex++;
                this.processStep();
            }
        }
    },

    // ドラッグ成功時に呼ばれる
    advanceFromDrag() {
        this.currentIndex++;
        // 少しディレイを入れてから次のステップへ
        setTimeout(() => {
            this.processStep();
        }, 800);
    }
};

/**
 * ゲームのメインロジック
 */
const GameManager = {
    currentStep: 1, // 現在はめるべきパーツ/ターゲットの番号
    totalSteps: 8,  // 全部で8パーツ
    isDragging: false,
    bgmStarted: false,
    draggedElement: null,
    dragOffset: { x: 0, y: 0 },
    initialPositions: {}, // インベントリの初期位置を保存

    currentWaitTarget: null, // シナリオから指示された待機ターゲットID

    init() {
        ScaleManager.init();
        this.cacheInitialPositions();
        this.setupDragEvents();

        ScenarioManager.init();

        // 最初のクリック/タップでBGMとシナリオを同時に開始する（自動再生ブロック対策）
        const startOnInteraction = () => {
            if (!this.bgmStarted) {
                const bgm = document.getElementById('se-bgm');
                if (bgm) {
                    bgm.volume = 0.3;
                    bgm.play().catch(e => console.log("Audio play blocked."));
                }
                this.bgmStarted = true;
                ScenarioManager.startScenerio();
            }
            document.removeEventListener('click', startOnInteraction);
            document.removeEventListener('touchstart', startOnInteraction);
        };
        document.addEventListener('click', startOnInteraction, true); // capture で先に発火
        document.addEventListener('touchstart', startOnInteraction, { capture: true, passive: true });
    },

    cacheInitialPositions() {
        const parts = document.querySelectorAll('.draggable-part');
        const container = document.getElementById('game-container');
        const clearOverlay = document.getElementById('clear-overlay');

        const scale = ScaleManager.scale;
        const containerRect = container.getBoundingClientRect();

        parts.forEach(part => {
            const rect = part.getBoundingClientRect();
            const x = (rect.left - containerRect.left) / scale;
            const y = (rect.top - containerRect.top) / scale;

            this.initialPositions[part.id] = { x, y };
        });

        parts.forEach(part => {
            const pos = this.initialPositions[part.id];

            part.style.position = 'absolute';
            part.style.margin = '0';
            part.style.left = `${pos.x}px`;
            part.style.top = `${pos.y}px`;

            container.insertBefore(part, clearOverlay);
        });
    },

    setWaitTarget(targetId) {
        this.currentWaitTarget = targetId;
        // 正解パーツを金色にハイライト
        document.querySelectorAll('.draggable-part').forEach(el => {
            if (parseInt(el.dataset.id) === targetId) {
                el.classList.add('highlight-part');
            } else {
                el.classList.remove('highlight-part');
            }
        });
    },

    // 自動ドラッグアニメーション（佐藤さんのデモ用）
    executeAutoDrag(targetId, callback) {
        const element = document.getElementById(`part-${targetId}`);
        if (!element) {
            if (callback) callback();
            return;
        }

        // 持ち上げ効果音
        const seTake = document.getElementById('se-take');
        if (seTake) { seTake.currentTime = 0; seTake.play().catch(() => { }); }

        // 要素を少し浮かせる
        element.style.transition = 'transform 0.3s ease';
        element.style.transform = 'scale(1.1)';
        element.style.zIndex = '100';

        setTimeout(() => {
            // 目標座標へ移動
            const target = document.querySelector(`.drop-target[data-step="${targetId}"]`);
            const tLeft = target.offsetLeft + 40;
            const tTop = target.offsetTop + 40;
            const snapX = tLeft + (target.offsetWidth - element.offsetWidth) / 2;
            const snapY = tTop + (target.offsetHeight - element.offsetHeight) / 2;

            element.style.transition = 'all 1.0s cubic-bezier(0.25, 0.8, 0.25, 1)';
            element.style.left = `${snapX}px`;
            element.style.top = `${snapY}px`;

            setTimeout(() => {
                element.style.transform = 'scale(1.0)';
                this.handleSuccessDrop(element, true); // true = 自動デモフラグ
                if (callback) callback();
            }, 1000);
        }, 400);
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

        // ダイアログ表示中など、インターフェースロック時は何もしない
        if (document.body.classList.contains('dialogue-active')) return;

        // シナリオで待機中のターゲットがある場合、それ以外は掴んでも無効にする（あるいはエラー音）
        const partId = parseInt(element.dataset.id);
        if (this.currentWaitTarget !== null && partId !== this.currentWaitTarget) {
            const seMiss = document.getElementById('se-miss');
            if (seMiss) {
                seMiss.currentTime = 0;
                seMiss.play().catch(e => console.log("Audio play blocked."));
            }
            // 揺れるアニメーションなどを入れると親切
            element.style.transform = 'translate(5px, 0)';
            setTimeout(() => element.style.transform = 'translate(-5px, 0)', 50);
            setTimeout(() => element.style.transform = 'translate(5px, 0)', 100);
            setTimeout(() => element.style.transform = 'translate(0, 0)', 150);
            return;
        }

        // take sfx
        const seTake = document.getElementById('se-take');
        if (seTake) {
            seTake.currentTime = 0;
            seTake.play().catch(e => console.log("Audio play blocked."));
        }

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

        const target = document.querySelector(`.drop-target[data-step="${partId}"]`);
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
        const hitRadius = 250; // 少し広めに判定 (ユーザーの要望でさらに拡大)

        return distance < hitRadius;
    },

    handleSuccessDrop(element, isAutoDemo = false) {
        const partId = parseInt(element.dataset.id);
        const target = document.querySelector(`.drop-target[data-step="${partId}"]`);

        // ターゲットの位置にピタッと合わせる
        const tLeft = target.offsetLeft + 40;
        const tTop = target.offsetTop + 40;
        const tWidth = target.offsetWidth;
        const tHeight = target.offsetHeight;

        const elWidth = element.offsetWidth;
        const elHeight = element.offsetHeight;

        const snapX = tLeft + (tWidth - elWidth) / 2;
        const snapY = tTop + (tHeight - elHeight) / 2;

        element.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        element.style.left = `${snapX}px`;
        element.style.top = `${snapY}px`;

        element.classList.add('snapped');
        element.classList.remove('highlight-part');
        element.querySelector('img').style.opacity = '0';

        const sil = document.getElementById(`sil-${partId}`);
        if (sil) {
            sil.classList.add('hidden-silhouette');
        }

        // SE再生
        const se = document.getElementById('se-set');
        if (se) {
            se.currentTime = 0;
            se.play().catch(e => console.log("Audio play blocked."));
        }

        // トランジション終わったらスタイルリセット
        setTimeout(() => {
            element.style.transition = 'transform 0.1s';
        }, 300);

        // シナリオ進行を呼ぶ（手動ドラッグ成功時のみ）
        if (!isAutoDemo) {
            ScenarioManager.advanceFromDrag();
        }
    },

    handleFailDrop(element) {
        // ミス音
        const seMiss = document.getElementById('se-miss');
        if (seMiss) {
            seMiss.currentTime = 0;
            seMiss.play().catch(e => console.log("Audio play blocked."));
        }

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

        // bgmを止める
        const bgm = document.getElementById('se-bgm');
        if (bgm) {
            bgm.pause();
            bgm.currentTime = 0;
        }

        // クリア音
        const se = document.getElementById('se-success');
        if (se) {
            se.currentTime = 0;
            se.play().catch(e => console.log("Audio play blocked."));
        }

        // 少し待ってからクリア画面
        setTimeout(() => {
            // シルエットの上に完成図をアニメーション付きで表示
            document.getElementById('app-image-clear').classList.remove('hidden');

            // もう少し待ってからメッセージパネル表示
            setTimeout(() => {
                document.getElementById('clear-overlay').classList.remove('hidden');
            }, 500);

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
