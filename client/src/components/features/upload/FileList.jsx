/**
 * @fileoverview File list component showing upload progress
 */

import { useSelector } from 'react-redux';
import { formatFileSize } from '../../../utils/fileHelpers';
import './FileList.css';

export default function FileList() {
    const files = useSelector(state => state.upload.files);
    const fileIds = useSelector(state => state.upload.fileIds);

    if (fileIds.length === 0) {
        return null;
    }

    return (
        <div className="file-list">
            <h3>Processing Files</h3>
            {fileIds.map(id => {
                const file = files[id];
                return (
                    <div key={id} className="file-item">
                        <div className="file-info">
                            <div className="file-name">{file.name}</div>
                            <div className="file-meta">
                                {formatFileSize(file.size)} • {file.status}
                            </div>
                        </div>

                        <div className="file-status">
                            {file.status === 'processing' || file.status === 'uploading' ? (
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${file.progress}%` }}
                                    />
                                </div>
                            ) : file.status === 'completed' ? (
                                <span className="status-badge success">✓ Completed</span>
                            ) : file.status === 'error' ? (
                                <span className="status-badge error">✗ Error</span>
                            ) : null}
                        </div>

                        {file.error && (
                            <div className="file-error">{file.error}</div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
