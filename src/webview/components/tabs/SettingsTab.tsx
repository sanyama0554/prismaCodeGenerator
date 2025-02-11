import React from 'react';

export function SettingsTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">設定</h3>
        
        {/* 出力設定 */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">出力設定</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={true}
                  onChange={() => {}}
                />
                <span className="text-sm">TypeScript型定義を生成</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={true}
                  onChange={() => {}}
                />
                <span className="text-sm">Zodスキーマを生成</span>
              </label>
            </div>
          </div>

          {/* コードスタイル設定 */}
          <div>
            <h4 className="text-sm font-medium mb-2">コードスタイル</h4>
            <div className="space-y-2">
              <div>
                <label className="text-sm block mb-1">インデント</label>
                <select className="w-full border rounded-md p-1">
                  <option value="2">2スペース</option>
                  <option value="4">4スペース</option>
                  <option value="tab">タブ</option>
                </select>
              </div>
              <div>
                <label className="text-sm block mb-1">引用符</label>
                <select className="w-full border rounded-md p-1">
                  <option value="single">シングルクォート</option>
                  <option value="double">ダブルクォート</option>
                </select>
              </div>
            </div>
          </div>

          {/* 出力先設定 */}
          <div>
            <h4 className="text-sm font-medium mb-2">出力先</h4>
            <div className="space-y-2">
              <div>
                <label className="text-sm block mb-1">生成コードの出力先</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-1"
                  placeholder="./src/generated"
                  value="./src/generated"
                  onChange={() => {}}
                />
              </div>
              <div>
                <label className="text-sm block mb-1">型定義の出力先</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-1"
                  placeholder="./src/types"
                  value="./src/types"
                  onChange={() => {}}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <button
          className="mt-6 w-full bg-primary text-primary-foreground rounded-md p-2"
          onClick={() => {}}
        >
          設定を保存
        </button>
      </div>
    </div>
  );
} 